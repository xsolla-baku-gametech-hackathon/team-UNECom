"""Fraud detection graph + risk scoring engine (FastAPI).

Endpoint-ler ucun /engine/README.md-e bax.
"""
from __future__ import annotations

import logging
import uuid
from collections import OrderedDict
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .community import build_rings, community_avg_risk, detect_communities
from .explain import build_evidence, call_claude
from .graph_builder import build_graph, to_undirected_weighted
from .risk_scoring import combine_scores, compute_degree_imbalance, compute_taint, compute_velocity
from .schema import AccountResult, AnalyzeRequest, AnalyzeResponse, ExplainResponse, RingResult

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Post-Purchase Value Flow — Fraud Detection Engine",
    description="Qraf-esasli risk skorlama + Claude API izah qatı (Xsolla Baku GameTech Hackathon).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Analysis results live in process memory only (enough for the prototype).
# The API calls /analyze on every GET /graph and before every explanation, so
# an unbounded dict grows for as long as the process lives; keep the most
# recent MAX_ANALYSES and drop the oldest. /explain only ever needs the one
# the API just created.
MAX_ANALYSES = 32
ANALYSES: "OrderedDict[str, dict]" = OrderedDict()
LATEST_ANALYSIS_ID: str | None = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    global LATEST_ANALYSIS_ID

    events = sorted(
        (e.model_dump() for e in req.events),
        key=lambda e: e["timestamp"],
    )

    G, account_created_at = build_graph(events)
    taint = compute_taint(events)
    velocity = compute_velocity(events, account_created_at)
    degree = compute_degree_imbalance(G)

    all_accounts = set(G.nodes()) | set(taint.keys())

    # 1-ci gedis: icma riski bilinmeden (0 qebul edilir) preliminary skor
    prelim_scores = combine_scores(all_accounts, taint, velocity, degree, community_risk={})

    H = to_undirected_weighted(G)
    node_to_community = detect_communities(H)
    community_risk = community_avg_risk(node_to_community, prelim_scores)

    # 2-ci gedis: icma sinyali daxil edilerek final skor
    final_scores = combine_scores(all_accounts, taint, velocity, degree, community_risk)

    rings = build_rings(node_to_community, final_scores, taint)

    analysis_id = f"an_{uuid.uuid4().hex[:12]}"
    ANALYSES[analysis_id] = {
        "rings": {r["ring_id"]: r for r in rings},
        "accounts": final_scores,
        "taint": taint,
        "account_created_at": account_created_at,
    }
    LATEST_ANALYSIS_ID = analysis_id
    while len(ANALYSES) > MAX_ANALYSES:
        ANALYSES.popitem(last=False)

    account_results = [
        AccountResult(
            account_id=acc,
            in_degree=scores["in_degree"],
            out_degree=scores["out_degree"],
            in_value_usd=scores["in_value_usd"],
            out_value_usd=scores["out_value_usd"],
            taint_score=scores["taint_score"],
            velocity_score=scores["velocity_score"],
            imbalance_score=scores["imbalance_score"],
            risk_score=scores["risk_score"],
            community_id=node_to_community.get(acc),
            flags=scores["flags"],
        )
        for acc, scores in final_scores.items()
    ]
    account_results.sort(key=lambda a: a.risk_score, reverse=True)

    ring_results = [RingResult(**r) for r in rings]

    return AnalyzeResponse(
        analysis_id=analysis_id,
        generated_at=datetime.now(timezone.utc),
        num_events=len(events),
        num_accounts=len(all_accounts),
        accounts=account_results,
        rings=ring_results,
    )


@app.get("/explain/{ring_id}", response_model=ExplainResponse)
def explain(ring_id: str, analysis_id: str | None = Query(default=None)):
    aid = analysis_id or LATEST_ANALYSIS_ID
    if aid is None or aid not in ANALYSES:
        raise HTTPException(
            status_code=404,
            detail="Once POST /analyze cagirilmalidir (analysis_id tapilmadi).",
        )

    data = ANALYSES[aid]
    ring = data["rings"].get(ring_id)
    if ring is None:
        raise HTTPException(status_code=404, detail=f"'{ring_id}' bu analizde tapilmadi.")

    evidence = build_evidence(ring, data["accounts"], data["taint"], data["account_created_at"])
    explanation, ai_generated = call_claude(evidence)

    return ExplainResponse(
        ring_id=ring_id,
        explanation=explanation,
        ai_generated=ai_generated,
        evidence=evidence,
    )
