"""Unit tests for app/graph_builder.py — building the value-flow graph from
raw events. STORE (the payment source) must never appear as a graph node,
and purchases must never become edges (they feed taint tracing instead,
see risk_scoring.compute_taint)."""
from __future__ import annotations

from datetime import datetime

from app.graph_builder import STORE_ACCOUNT, build_graph, to_undirected_weighted

T0 = datetime(2026, 9, 10, 0, 0, 0)


def test_store_account_never_becomes_a_node():
    events = [
        {
            "event_id": "e1", "type": "purchase", "from_account_id": "STORE",
            "to_account_id": "acct_a", "value_usd_estimate": 10.0,
            "asset_type": "currency", "timestamp": T0, "account_created_at": T0,
        }
    ]
    G, _ = build_graph(events)
    assert STORE_ACCOUNT not in G.nodes()
    assert "acct_a" not in G.nodes()  # purchase alone creates no P2P edge either


def test_p2p_transfer_creates_an_edge():
    events = [
        {
            "event_id": "e1", "type": "trade", "from_account_id": "acct_a",
            "to_account_id": "acct_b", "value_usd_estimate": 25.0,
            "asset_type": "item", "timestamp": T0, "account_created_at": T0,
        }
    ]
    G, _ = build_graph(events)
    assert G.has_edge("acct_a", "acct_b")
    assert G.number_of_nodes() == 2


def test_account_created_at_extracted_from_first_from_account_event():
    events = [
        {
            "event_id": "e1", "type": "trade", "from_account_id": "acct_a",
            "to_account_id": "acct_b", "value_usd_estimate": 5.0,
            "asset_type": "currency", "timestamp": T0, "account_created_at": T0,
        }
    ]
    _, created = build_graph(events)
    assert created["acct_a"] == T0
    assert "acct_b" not in created  # only recorded from the sender side


def test_to_undirected_weighted_sums_parallel_edges():
    events = [
        {"event_id": "e1", "type": "trade", "from_account_id": "acct_a", "to_account_id": "acct_b",
         "value_usd_estimate": 10.0, "asset_type": "item", "timestamp": T0, "account_created_at": T0},
        {"event_id": "e2", "type": "gift", "from_account_id": "acct_a", "to_account_id": "acct_b",
         "value_usd_estimate": 15.0, "asset_type": "currency", "timestamp": T0, "account_created_at": T0},
    ]
    G, _ = build_graph(events)
    H = to_undirected_weighted(G)
    assert H["acct_a"]["acct_b"]["weight"] == 25.0
