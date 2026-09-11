"""Risk scoring signals.

Four independent signals are computed, then combined with fixed weights:
  1. taint_score      - how much of an account's value originates in flagged
                        (payment_flagged) purchases, propagated along the graph
                        with "haircut" tainting, a method common in crypto forensics.
  2. velocity_score   - how soon after creation the account made its first
                        outgoing transfer (a brand-new account moving value at
                        once is suspicious).
  3. imbalance_score  - in/out-degree imbalance (many in, few out = hub).
  4. community_risk   - the overall risk of the account's community (see community.py).
"""
from __future__ import annotations

from collections import defaultdict
from datetime import datetime
from typing import Iterable

import networkx as nx


WEIGHTS = {
    "taint": 0.40,
    "velocity": 0.25,
    "imbalance": 0.20,
    "community": 0.15,
}

VELOCITY_HALF_SCALE_HOURS = 12.0
IMBALANCE_HUB_THRESHOLD = 0.3


def compute_taint(events_sorted: list[dict]) -> dict[str, dict]:
    """Compute a tainted/clean USD pool for every account (haircut tainting).

    Rule: a flagged purchase adds its value to the buyer's "tainted" pool,
    any other purchase to the "clean" pool. Each outgoing transfer then
    carries value to the receiver in the sender's current tainted ratio.
    The sender's pool is not debited (a simplification that treats assets as
    fungible); the ratio stays correct, which is all tracing taint needs, but
    absolute dollar amounts are overstated.
    """
    pools: dict[str, dict[str, float]] = defaultdict(lambda: {"tainted": 0.0, "clean": 0.0})
    flagged_purchase_count: dict[str, int] = defaultdict(int)
    total_purchase_count: dict[str, int] = defaultdict(int)

    for e in events_sorted:
        value = e["value_usd_estimate"]
        if e["type"] == "purchase":
            dst = e["to_account_id"]
            total_purchase_count[dst] += 1
            if e.get("payment_flagged"):
                pools[dst]["tainted"] += value
                flagged_purchase_count[dst] += 1
            else:
                pools[dst]["clean"] += value
            continue

        src, dst = e["from_account_id"], e["to_account_id"]
        pool = pools[src]
        total = pool["tainted"] + pool["clean"]
        taint_frac = (pool["tainted"] / total) if total > 0 else 0.0
        pools[dst]["tainted"] += value * taint_frac
        pools[dst]["clean"] += value * (1 - taint_frac)

    result: dict[str, dict] = {}
    accounts = set(pools) | set(flagged_purchase_count) | set(total_purchase_count)
    for acc in accounts:
        p = pools[acc]
        total = p["tainted"] + p["clean"]
        result[acc] = {
            "taint_score": (p["tainted"] / total) if total > 0 else 0.0,
            "tainted_usd": p["tainted"],
            "clean_usd": p["clean"],
            "flagged_purchase_count": flagged_purchase_count.get(acc, 0),
            "total_purchase_count": total_purchase_count.get(acc, 0),
        }
    return result


def compute_velocity(
    events_sorted: list[dict],
    account_created_at: dict[str, datetime],
) -> dict[str, float]:
    """Score by time from account creation to first outgoing transfer (0..1, sooner = higher)."""
    first_outgoing: dict[str, datetime] = {}
    for e in events_sorted:
        if e["type"] == "purchase":
            continue
        src = e["from_account_id"]
        if src not in first_outgoing:
            first_outgoing[src] = e["timestamp"]

    velocity_score: dict[str, float] = {}
    for acc, created in account_created_at.items():
        if acc not in first_outgoing:
            velocity_score[acc] = 0.0
            continue
        hours = max((first_outgoing[acc] - created).total_seconds() / 3600.0, 0.0)
        velocity_score[acc] = 1.0 / (1.0 + hours / VELOCITY_HALF_SCALE_HOURS)
    return velocity_score


def compute_degree_imbalance(G: nx.MultiDiGraph) -> dict[str, dict]:
    """In/out-degree imbalance: many inbound + few outbound = hub-like pattern."""
    result: dict[str, dict] = {}
    for node in G.nodes():
        in_deg = G.in_degree(node)
        out_deg = G.out_degree(node)
        in_val = sum(d["value_usd_estimate"] for _, _, d in G.in_edges(node, data=True))
        out_val = sum(d["value_usd_estimate"] for _, _, d in G.out_edges(node, data=True))
        total_deg = in_deg + out_deg
        ratio = (in_deg - out_deg) / total_deg if total_deg > 0 else 0.0
        result[node] = {
            "in_degree": in_deg,
            "out_degree": out_deg,
            "in_value_usd": in_val,
            "out_value_usd": out_val,
            "imbalance_score": max(ratio, 0.0),  # only the hub-like direction counts as risk
        }
    return result


def combine_scores(
    accounts: Iterable[str],
    taint: dict[str, dict],
    velocity: dict[str, float],
    degree: dict[str, dict],
    community_risk: dict[str, float],
) -> dict[str, dict]:
    out = {}
    for acc in accounts:
        t = taint.get(acc, {}).get("taint_score", 0.0)
        v = velocity.get(acc, 0.0)
        d = degree.get(acc, {})
        imb = d.get("imbalance_score", 0.0)
        c = community_risk.get(acc, 0.0)

        risk = 100 * (
            WEIGHTS["taint"] * t
            + WEIGHTS["velocity"] * v
            + WEIGHTS["imbalance"] * imb
            + WEIGHTS["community"] * c
        )

        flags = []
        if t >= 0.5:
            flags.append("tainted-funds")
        if taint.get(acc, {}).get("flagged_purchase_count", 0) > 0:
            flags.append("flagged-purchase-source")
        if v >= 0.5:
            flags.append("fast-account-fast-spend")
        if imb >= IMBALANCE_HUB_THRESHOLD:
            flags.append("hub-pattern")
        if c >= 0.5:
            flags.append("high-risk-community")

        out[acc] = {
            "taint_score": round(t, 4),
            "velocity_score": round(v, 4),
            "imbalance_score": round(imb, 4),
            "in_degree": d.get("in_degree", 0),
            "out_degree": d.get("out_degree", 0),
            "in_value_usd": round(d.get("in_value_usd", 0.0), 2),
            "out_value_usd": round(d.get("out_value_usd", 0.0), 2),
            "risk_score": round(min(risk, 100.0), 2),
            "flags": flags,
        }
    return out
