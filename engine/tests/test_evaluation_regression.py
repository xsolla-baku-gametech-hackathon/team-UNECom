"""Accuracy regression guard for the scoring pipeline.

`eval/evaluate.py` measures the engine against the ring planted by
data-generator/generate.py. This test pins those measurements down so a
change to the scoring math that quietly destroys detection quality fails CI
instead of shipping.

The bounds are deliberately set BELOW the values measured at the time of
writing (see docs/accuracy.md) — they are floors that catch regressions, not
targets that describe current performance. If a scoring change legitimately
moves a number, re-run the harness, update docs/accuracy.md, and move the
floor in the same commit.
"""
from __future__ import annotations

import pytest

from eval.evaluate import evaluate_seed, recall_for, threshold_for

# Two seeds keep the test near ~1.5s while still guarding against a single
# lucky dataset; docs/accuracy.md reports the full five-seed picture.
SEEDS = (42, 43)

# Floors, measured 2026-09-10 at default sensitivity 0.5 (risk >= 56):
#   precision 100.0%, recall 64.6% ± 5.5, mule recall 67.2%, F1 78.4%
MIN_PRECISION = 0.90
MIN_RECALL = 0.50
MIN_MULE_RECALL = 0.50
MIN_F1 = 0.65

# Ring level, measured: purity 94.9% (min 90.7%), coverage 80.0% (min 71.2%)
MIN_RING_PURITY = 0.80
MIN_RING_COVERAGE = 0.60

# Hubs do NOT clear the default cut-off (measured hub recall at 0.5 is 0%);
# they only surface once the slider is pushed up. This is a known limitation
# documented in docs/accuracy.md, pinned here so it cannot get worse silently.
HUB_SENSITIVITY = 0.8
MIN_HUB_RECALL_AT_HIGH_SENSITIVITY = 0.90


@pytest.fixture(scope="module", params=SEEDS, ids=lambda s: f"seed{s}")
def result(request):
    return evaluate_seed(request.param)


def test_ground_truth_labels_agree_with_generator(result):
    """Name-derived labels must match the generator's own ground_truth.json."""
    assert result.ground_truth_mismatch == []
    assert result.unscored_positives == []


def test_precision_above_floor(result):
    assert result.default.precision >= MIN_PRECISION, (
        f"seed {result.seed}: precision {result.default.precision:.3f} "
        f"below floor {MIN_PRECISION} — the engine started flagging clean accounts"
    )


def test_recall_above_floor(result):
    assert result.default.recall >= MIN_RECALL, (
        f"seed {result.seed}: recall {result.default.recall:.3f} below floor "
        f"{MIN_RECALL} — the engine is missing planted ring members"
    )


def test_f1_above_floor(result):
    assert result.default.f1 >= MIN_F1, f"seed {result.seed}: F1 {result.default.f1:.3f}"


def test_mule_recall_above_floor(result):
    assert result.mule_recall >= MIN_MULE_RECALL, (
        f"seed {result.seed}: mule recall {result.mule_recall:.3f}"
    )


def test_top_ring_is_mostly_the_planted_ring(result):
    assert result.rings["purity"] >= MIN_RING_PURITY, (
        f"seed {result.seed}: top ring purity {result.rings['purity']:.3f} — "
        "the highest-risk ring filled up with clean accounts"
    )
    assert result.rings["coverage"] >= MIN_RING_COVERAGE, (
        f"seed {result.seed}: top ring coverage {result.rings['coverage']:.3f} — "
        "the planted ring got fragmented across communities"
    )


def test_hubs_are_recoverable_at_high_sensitivity(result):
    """Hubs are our headline claim; they must at least surface when asked for."""
    threshold = threshold_for(HUB_SENSITIVITY)
    hub_recall = recall_for(result.scores, threshold, result.hubs)
    assert hub_recall >= MIN_HUB_RECALL_AT_HIGH_SENSITIVITY, (
        f"seed {result.seed}: hub recall {hub_recall:.3f} at sensitivity "
        f"{HUB_SENSITIVITY} (risk >= {threshold:.0f})"
    )


def test_raising_sensitivity_never_lowers_recall(result):
    """The slider must be monotonic — that is what makes it an honest control."""
    recalls = [point["recall"] for point in result.sweep]
    assert recalls == sorted(recalls), f"seed {result.seed}: non-monotonic recall {recalls}"
