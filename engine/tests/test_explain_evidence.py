"""The explanation layer must receive the hub's own measurements."""
from __future__ import annotations

import json
from pathlib import Path

from app import main
from app.explain import build_evidence
from app.schema import AnalyzeRequest

SAMPLE = Path(__file__).resolve().parent.parent / "sample_data" / "analyze_request.json"


def test_evidence_carries_hub_measurements():
    resp = main.analyze(AnalyzeRequest(**json.loads(SAMPLE.read_text())))
    data = main.ANALYSES[resp.analysis_id]
    ring = next(r for r in data["rings"].values() if r["hub_candidates"])

    ev = build_evidence(ring, data["accounts"], data["taint"], data["account_created_at"])

    assert [d["account_id"] for d in ev["hub_candidate_details"]] == ring["hub_candidates"]
    for d in ev["hub_candidate_details"]:
        assert d["in_degree"] is not None and d["out_degree"] is not None
        assert d["in_value_usd"] is not None and d["own_flagged_purchase_count"] >= 0
    json.dumps(ev)  # must stay JSON-serialisable for the Claude prompt
