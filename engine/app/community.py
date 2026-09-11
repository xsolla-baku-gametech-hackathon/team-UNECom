"""Community / ring detection (Louvain, networkx's built-in implementation)."""
from __future__ import annotations

import networkx as nx

MIN_RING_SIZE = 3
RING_RISK_THRESHOLD = 15.0  # communities with a lower average risk are not reported as rings


def detect_communities(H: nx.Graph) -> dict[str, int]:
    """Assign a community_id to every node; an edgeless graph gets one id per node."""
    if H.number_of_edges() == 0:
        return {node: idx for idx, node in enumerate(H.nodes())}

    communities = nx.algorithms.community.louvain_communities(H, weight="weight", seed=42)
    node_to_community: dict[str, int] = {}
    for idx, community in enumerate(communities):
        for node in community:
            node_to_community[node] = idx
    return node_to_community


def community_avg_risk(
    node_to_community: dict[str, int],
    account_scores: dict[str, dict],
) -> dict[str, float]:
    """Return, for every node, the AVERAGE risk score of its community (the
    node's own score is included in the average).

    This is a separate signal fed back into combine_scores, so individual
    account risk and community risk reinforce each other.
    """
    by_community: dict[int, list[str]] = {}
    for node, cid in node_to_community.items():
        by_community.setdefault(cid, []).append(node)

    community_avg: dict[int, float] = {}
    for cid, members in by_community.items():
        scores = [account_scores.get(m, {}).get("risk_score", 0.0) for m in members]
        community_avg[cid] = (sum(scores) / len(scores) / 100.0) if scores else 0.0

    return {node: community_avg[cid] for node, cid in node_to_community.items()}


def build_rings(
    node_to_community: dict[str, int],
    account_scores: dict[str, dict],
    taint: dict[str, dict],
) -> list[dict]:
    by_community: dict[int, list[str]] = {}
    for node, cid in node_to_community.items():
        by_community.setdefault(cid, []).append(node)

    rings = []
    for cid, members in by_community.items():
        if len(members) < MIN_RING_SIZE:
            continue

        risk_scores = [account_scores.get(m, {}).get("risk_score", 0.0) for m in members]
        avg_risk = sum(risk_scores) / len(risk_scores)
        if avg_risk < RING_RISK_THRESHOLD:
            continue

        avg_taint = sum(taint.get(m, {}).get("taint_score", 0.0) for m in members) / len(members)
        flagged_count = sum(taint.get(m, {}).get("flagged_purchase_count", 0) for m in members)
        total_value = sum(
            account_scores.get(m, {}).get("in_value_usd", 0.0) for m in members
        )
        hub_candidates = sorted(
            members,
            key=lambda m: account_scores.get(m, {}).get("imbalance_score", 0.0),
            reverse=True,
        )[:3]
        hub_candidates = [
            m for m in hub_candidates
            if account_scores.get(m, {}).get("imbalance_score", 0.0) > 0
        ]

        rings.append({
            "ring_id": f"ring_{cid}",
            "account_ids": sorted(members),
            "size": len(members),
            "risk_score": round(avg_risk, 2),
            "avg_taint_score": round(avg_taint, 4),
            "flagged_purchase_count": flagged_count,
            "total_value_usd": round(total_value, 2),
            "hub_candidates": hub_candidates,
        })

    rings.sort(key=lambda r: r["risk_score"], reverse=True)
    return rings
