"""Build a directed value-flow graph from events.

STORE (the shop / payment system) is NOT added to the graph as an account:
it is not a player, only the source of purchase events. Purchases are kept
separately and used for tainted-value tracing (see risk_scoring.py).
"""
from __future__ import annotations

from datetime import datetime

import networkx as nx

STORE_ACCOUNT = "STORE"


def build_graph(events: list[dict]) -> tuple[nx.MultiDiGraph, dict[str, datetime]]:
    """Build the graph from P2P events (trade/gift/marketplace_sale/key_redeem).

    Returns:
      G: node = account, one edge per P2P event (weight = value_usd_estimate)
      account_created_at: account_id -> creation time (taken from from_account_id)
    """
    G = nx.MultiDiGraph()
    account_created_at: dict[str, datetime] = {}

    for e in events:
        if e["from_account_id"] != STORE_ACCOUNT and e.get("account_created_at"):
            account_created_at.setdefault(e["from_account_id"], e["account_created_at"])

        if e["type"] == "purchase":
            continue  # STORE -> account: not a graph edge, feeds taint tracing

        src, dst = e["from_account_id"], e["to_account_id"]
        G.add_node(src)
        G.add_node(dst)
        G.add_edge(
            src, dst,
            event_id=e["event_id"],
            type=e["type"],
            timestamp=e["timestamp"],
            value_usd_estimate=e["value_usd_estimate"],
            asset_type=e["asset_type"],
        )

    return G, account_created_at


def to_undirected_weighted(G: nx.MultiDiGraph) -> nx.Graph:
    """Simple weighted, undirected graph for community detection."""
    H = nx.Graph()
    H.add_nodes_from(G.nodes())
    for u, v, data in G.edges(data=True):
        w = data.get("value_usd_estimate", 1.0)
        if H.has_edge(u, v):
            H[u][v]["weight"] += w
        else:
            H.add_edge(u, v, weight=w)
    return H
