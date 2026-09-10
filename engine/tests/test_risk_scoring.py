"""Unit tests for the pure risk-scoring functions (app/risk_scoring.py).

These are the actual fraud-detection math: taint propagation, account-age
velocity, and in/out-degree imbalance. They're plain functions over lists
of dicts, so no FastAPI/HTTP setup is needed to test them directly.
"""
from __future__ import annotations

from datetime import datetime, timedelta

import networkx as nx
import pytest

from app.risk_scoring import (
    combine_scores,
    compute_degree_imbalance,
    compute_taint,
    compute_velocity,
)

T0 = datetime(2026, 9, 10, 0, 0, 0)


def purchase(dst: str, value: float, flagged: bool, at: datetime = T0) -> dict:
    return {
        "type": "purchase",
        "from_account_id": "STORE",
        "to_account_id": dst,
        "value_usd_estimate": value,
        "payment_flagged": flagged,
        "timestamp": at,
    }


def transfer(src: str, dst: str, value: float, at: datetime = T0) -> dict:
    return {
        "type": "trade",
        "from_account_id": src,
        "to_account_id": dst,
        "value_usd_estimate": value,
        "payment_flagged": False,
        "timestamp": at,
    }


class TestComputeTaint:
    def test_flagged_purchase_is_fully_tainted(self):
        events = [purchase("acct_a", 100.0, flagged=True)]
        result = compute_taint(events)
        assert result["acct_a"]["taint_score"] == pytest.approx(1.0)
        assert result["acct_a"]["flagged_purchase_count"] == 1

    def test_clean_purchase_stays_clean(self):
        events = [purchase("acct_a", 100.0, flagged=False)]
        result = compute_taint(events)
        assert result["acct_a"]["taint_score"] == pytest.approx(0.0)
        assert result["acct_a"]["flagged_purchase_count"] == 0

    def test_taint_propagates_through_transfer_chain(self):
        # acct_a buys with a stolen card, then moves it all to acct_b (a mule
        # hop), then acct_b moves it to acct_c. All three should end up
        # fully tainted, since it's the same money the whole way.
        events = [
            purchase("acct_a", 100.0, flagged=True),
            transfer("acct_a", "acct_b", 100.0, at=T0 + timedelta(hours=1)),
            transfer("acct_b", "acct_c", 100.0, at=T0 + timedelta(hours=2)),
        ]
        result = compute_taint(events)
        assert result["acct_b"]["taint_score"] == pytest.approx(1.0)
        assert result["acct_c"]["taint_score"] == pytest.approx(1.0)

    def test_mixed_clean_and_tainted_funds_blend_proportionally(self):
        # acct_a has $50 clean + $50 tainted, sends $100 onward — the
        # haircut-tainting model should split the outgoing value 50/50.
        events = [
            purchase("acct_a", 50.0, flagged=False),
            purchase("acct_a", 50.0, flagged=True),
            transfer("acct_a", "acct_b", 100.0, at=T0 + timedelta(hours=1)),
        ]
        result = compute_taint(events)
        assert result["acct_b"]["taint_score"] == pytest.approx(0.5)

    def test_account_with_no_events_is_absent(self):
        result = compute_taint([purchase("acct_a", 10.0, flagged=False)])
        assert "acct_zzz" not in result


class TestComputeVelocity:
    def test_fast_first_spend_scores_high(self):
        # Account created, then spends within minutes — classic mule pattern.
        created = {"acct_a": T0}
        events = [transfer("acct_a", "acct_b", 10.0, at=T0 + timedelta(minutes=5))]
        result = compute_velocity(events, created)
        assert result["acct_a"] > 0.9

    def test_slow_first_spend_scores_low(self):
        # Account sits idle for weeks before its first outgoing transfer —
        # looks like a normal player, not a mule.
        created = {"acct_a": T0}
        events = [transfer("acct_a", "acct_b", 10.0, at=T0 + timedelta(days=30))]
        result = compute_velocity(events, created)
        assert result["acct_a"] < 0.1

    def test_account_with_no_outgoing_transfer_scores_zero(self):
        created = {"acct_a": T0}
        result = compute_velocity([], created)
        assert result["acct_a"] == 0.0

    def test_purchase_events_do_not_count_as_outgoing_spend(self):
        # A purchase's "from" is STORE, not the account — must not be
        # mistaken for the account's own first outgoing transfer.
        created = {"acct_a": T0}
        events = [purchase("acct_a", 10.0, flagged=False, at=T0 + timedelta(minutes=1))]
        result = compute_velocity(events, created)
        assert result["acct_a"] == 0.0


class TestComputeDegreeImbalance:
    def test_hub_pattern_many_in_one_out(self):
        G = nx.MultiDiGraph()
        for i in range(5):
            G.add_edge(f"mule_{i}", "hub", value_usd_estimate=20.0)
        G.add_edge("hub", "cashout", value_usd_estimate=100.0)

        result = compute_degree_imbalance(G)
        assert result["hub"]["in_degree"] == 5
        assert result["hub"]["out_degree"] == 1
        assert result["hub"]["imbalance_score"] > 0.5

    def test_balanced_trading_account_scores_near_zero(self):
        G = nx.MultiDiGraph()
        G.add_edge("acct_a", "acct_b", value_usd_estimate=10.0)
        G.add_edge("acct_b", "acct_a", value_usd_estimate=10.0)

        result = compute_degree_imbalance(G)
        assert result["acct_a"]["imbalance_score"] == pytest.approx(0.0)

    def test_pure_outflow_is_not_penalized_as_hub(self):
        # imbalance_score is clamped to 0 for accounts that mostly SEND
        # (negative ratio) — only "money piles up here" shapes count as risk.
        G = nx.MultiDiGraph()
        G.add_edge("acct_a", "acct_b", value_usd_estimate=10.0)
        G.add_edge("acct_a", "acct_c", value_usd_estimate=10.0)

        result = compute_degree_imbalance(G)
        assert result["acct_a"]["imbalance_score"] == 0.0


class TestCombineScores:
    def test_risk_score_never_exceeds_100(self):
        taint = {"acct_a": {"taint_score": 1.0, "flagged_purchase_count": 5}}
        velocity = {"acct_a": 1.0}
        degree = {"acct_a": {"imbalance_score": 1.0, "in_degree": 10, "out_degree": 1,
                              "in_value_usd": 1000.0, "out_value_usd": 900.0}}
        community_risk = {"acct_a": 1.0}

        result = combine_scores(["acct_a"], taint, velocity, degree, community_risk)
        assert result["acct_a"]["risk_score"] <= 100.0

    def test_clean_account_scores_zero_with_no_flags(self):
        result = combine_scores(["acct_a"], {}, {}, {}, {})
        assert result["acct_a"]["risk_score"] == 0.0
        assert result["acct_a"]["flags"] == []

    def test_tainted_funds_flag_set_at_threshold(self):
        taint = {"acct_a": {"taint_score": 0.5, "flagged_purchase_count": 1}}
        result = combine_scores(["acct_a"], taint, {}, {}, {})
        assert "tainted-funds" in result["acct_a"]["flags"]
        assert "flagged-purchase-source" in result["acct_a"]["flags"]

    def test_hub_pattern_flag_set_at_threshold(self):
        degree = {"acct_a": {"imbalance_score": 0.3, "in_degree": 5, "out_degree": 1,
                              "in_value_usd": 500.0, "out_value_usd": 400.0}}
        result = combine_scores(["acct_a"], {}, {}, degree, {})
        assert "hub-pattern" in result["acct_a"]["flags"]

    def test_missing_account_data_defaults_safely(self):
        # An account with no taint/velocity/degree/community data at all
        # (e.g. present only because it appears in `accounts`) shouldn't crash.
        result = combine_scores(["acct_ghost"], {}, {}, {}, {})
        assert result["acct_ghost"]["risk_score"] == 0.0
