"""Hadiselerden (events) directed graph qurur.

STORE (magaza/odenis sistemi) hesab kimi qraf-a DAXIL EDILMIR — o, real
oyunçu deyil, purchase hadiselerinin menbeyidir. Purchase-lar ayrica
saxlanilir ve tainted-value tracing ucun istifade olunur (bax risk_scoring.py).
"""
from __future__ import annotations

from datetime import datetime

import networkx as nx

STORE_ACCOUNT = "STORE"


def build_graph(events: list[dict]) -> tuple[nx.MultiDiGraph, dict[str, datetime]]:
    """P2P (trade/gift/marketplace_sale/key_redeem) hadiselerinden qraf qurur.

    Qaytarir:
      G: node=hesab, her P2P hadise ucun bir kenar (weight=value_usd_estimate)
      account_created_at: hesab_id -> yaranma tarixi (from_account_id-den cixarilir)
    """
    G = nx.MultiDiGraph()
    account_created_at: dict[str, datetime] = {}

    for e in events:
        if e["from_account_id"] != STORE_ACCOUNT and e.get("account_created_at"):
            account_created_at.setdefault(e["from_account_id"], e["account_created_at"])

        if e["type"] == "purchase":
            continue  # STORE -> account, qrafa deyil, taint tracing-e gedir

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
    """Community detection ucun sade, cekili (weighted), yonlendirilmemis qraf."""
    H = nx.Graph()
    H.add_nodes_from(G.nodes())
    for u, v, data in G.edges(data=True):
        w = data.get("value_usd_estimate", 1.0)
        if H.has_edge(u, v):
            H[u][v]["weight"] += w
        else:
            H.add_edge(u, v, weight=w)
    return H
