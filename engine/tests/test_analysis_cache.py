"""The engine keeps recent analyses for /explain, but must not grow forever."""
from __future__ import annotations

import json
from pathlib import Path

from app import main
from app.schema import AnalyzeRequest

SAMPLE = Path(__file__).resolve().parent.parent / "sample_data" / "analyze_request.json"


def test_analyses_are_bounded_and_latest_is_kept():
    events = json.loads(SAMPLE.read_text())["events"][:200]
    req = AnalyzeRequest(events=events)
    main.ANALYSES.clear()

    ids = [main.analyze(req).analysis_id for _ in range(main.MAX_ANALYSES + 5)]

    assert len(main.ANALYSES) == main.MAX_ANALYSES
    assert ids[0] not in main.ANALYSES          # oldest evicted
    assert ids[-1] in main.ANALYSES             # newest kept for /explain
    assert main.LATEST_ANALYSIS_ID == ids[-1]
