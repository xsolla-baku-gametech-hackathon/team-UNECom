#!/usr/bin/env python3
"""Offline accuracy evaluation for the Fraud Tracker engine.

Measures the engine against the planted ground truth in the synthetic
dataset. Nothing here touches `app/` — the scoring pipeline is imported and
called as-is, through the exact same entry point the HTTP API uses
(`app.main.analyze`), so the numbers reported are the numbers the demo
produces. If a metric looks bad, the fix belongs in `app/`, never here.

Ground truth comes only from the generator's ground_truth.json:
  mule_accounts -> planted ring members (buy with a flagged card, forward value)
  hub_accounts  -> planted cash-out hubs (receive only; never flag a purchase)
  anything else -> clean / legitimate background account
Account ids themselves are opaque (acct_NNNN for everyone), so nothing about
an id says which class it is in — the engine could not cheat off the names
even if it tried, and neither can this harness.

Usage:
  python -m eval.evaluate                     # 5 seeds, human-readable report
  python -m eval.evaluate --seeds 42 43 44    # explicit seeds
  python -m eval.evaluate --markdown          # markdown tables for docs/accuracy.md
  python -m eval.evaluate --json out.json     # machine-readable dump
"""
from __future__ import annotations

import argparse
import csv
import json
import statistics
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from typing import AbstractSet as Set, Iterable, Sequence

ENGINE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = ENGINE_DIR.parent
GENERATOR = REPO_ROOT / "data-generator" / "generate.py"

if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

from app.main import analyze  # noqa: E402  (needs sys.path set up first)
from app.schema import AnalyzeRequest, AnalyzeResponse, Event  # noqa: E402

# The UI slider maps 0..1 sensitivity onto a risk threshold; keep this
# identical to web/src/lib/colors.ts::sensitivityToThreshold so the sweep
# below describes the control the jury actually sees on screen.
SENSITIVITY_INTERCEPT = 0.92
SENSITIVITY_SLOPE = 0.72
DEFAULT_SENSITIVITY = 0.5  # web/src/App.tsx initial slider state

DEFAULT_SEEDS = (42, 43, 44, 45, 46)
SWEEP_POINTS = 11  # sensitivity 0.0, 0.1, ... 1.0


def threshold_for(sensitivity: float) -> float:
    """Sensitivity (0..1) -> risk_score cut-off on the engine's 0..100 scale."""
    return 100.0 * (SENSITIVITY_INTERCEPT - SENSITIVITY_SLOPE * sensitivity)


# --------------------------------------------------------------- ground truth
@dataclass(frozen=True)
class GroundTruth:
    hubs: frozenset[str]
    mules: frozenset[str]

    @property
    def positives(self) -> frozenset[str]:
        return self.hubs | self.mules

    @classmethod
    def from_file(cls, data: dict) -> "GroundTruth":
        return cls(hubs=frozenset(data["hub_accounts"]), mules=frozenset(data["mule_accounts"]))


# ------------------------------------------------------------------- dataset
def generate_dataset(seed: int, out_dir: Path, **gen_args) -> Path:
    """Run the real data generator; never reimplement it here."""
    cmd = [sys.executable, str(GENERATOR), "--seed", str(seed), "--out-dir", str(out_dir)]
    for key, value in gen_args.items():
        cmd += [f"--{key.replace('_', '-')}", str(value)]
    subprocess.run(cmd, check=True, capture_output=True, cwd=REPO_ROOT)
    return out_dir / "events.csv"


def load_events(csv_path: Path) -> list[Event]:
    """Parse events.csv through the engine's own pydantic model."""
    events: list[Event] = []
    with csv_path.open(newline="") as f:
        for row in csv.DictReader(f):
            if not row.get("account_created_at"):
                row["account_created_at"] = None
            events.append(Event(**row))
    return events


# ------------------------------------------------------------------- metrics
@dataclass
class ConfusionMatrix:
    tp: int = 0
    fp: int = 0
    tn: int = 0
    fn: int = 0

    @property
    def precision(self) -> float:
        return self.tp / (self.tp + self.fp) if (self.tp + self.fp) else 0.0

    @property
    def recall(self) -> float:
        return self.tp / (self.tp + self.fn) if (self.tp + self.fn) else 0.0

    @property
    def f1(self) -> float:
        p, r = self.precision, self.recall
        return 2 * p * r / (p + r) if (p + r) else 0.0

    @property
    def false_positive_rate(self) -> float:
        return self.fp / (self.fp + self.tn) if (self.fp + self.tn) else 0.0

    def as_dict(self) -> dict:
        return {
            "tp": self.tp, "fp": self.fp, "tn": self.tn, "fn": self.fn,
            "precision": self.precision, "recall": self.recall, "f1": self.f1,
            "false_positive_rate": self.false_positive_rate,
        }


def confusion_at(scores: dict[str, float], threshold: float, positives: Set[str],
                 subset: Iterable[str] | None = None) -> ConfusionMatrix:
    """Confusion matrix over `subset` of accounts (default: all scored accounts)."""
    accounts = list(subset) if subset is not None else list(scores)
    cm = ConfusionMatrix()
    for acc in accounts:
        predicted = scores.get(acc, 0.0) >= threshold
        actual = acc in positives
        if predicted and actual:
            cm.tp += 1
        elif predicted and not actual:
            cm.fp += 1
        elif not predicted and actual:
            cm.fn += 1
        else:
            cm.tn += 1
    return cm


def recall_for(scores: dict[str, float], threshold: float,
               members: Sequence[str]) -> float:
    """Recall restricted to one class of planted accounts (e.g. hubs only)."""
    if not members:
        return 0.0
    caught = sum(1 for m in members if scores.get(m, 0.0) >= threshold)
    return caught / len(members)


# ---------------------------------------------------------------- ring metrics
def ring_metrics(response: AnalyzeResponse, truth: GroundTruth) -> dict:
    """How well did Louvain + ring ranking recover the planted ring?

    purity   = share of the top-ranked reported ring that is truly mule/hub
    coverage = share of all planted ring accounts sitting in that one ring
    """
    positives = truth.positives
    hubs = truth.hubs
    rings = response.rings  # already sorted by risk_score desc in build_rings
    if not rings:
        return {
            "num_rings": 0, "top_ring_id": None, "top_ring_size": 0,
            "purity": 0.0, "coverage": 0.0, "hub_in_top_ring": 0,
            "hubs_total": len(hubs),
            "communities_spanned": 0, "top_ring_risk": 0.0,
        }

    top = rings[0]
    members = set(top.account_ids)
    hit = members & positives

    # How many distinct communities the planted accounts were scattered across:
    # 1 = the ring was recovered as a single cluster.
    community_of = {a.account_id: a.community_id for a in response.accounts}
    spanned = {community_of.get(p) for p in positives if community_of.get(p) is not None}

    return {
        "num_rings": len(rings),
        "top_ring_id": top.ring_id,
        "top_ring_size": top.size,
        "top_ring_risk": top.risk_score,
        "purity": len(hit) / len(members) if members else 0.0,
        "coverage": len(hit) / len(positives) if positives else 0.0,
        "hub_in_top_ring": len(members & hubs),
        "hubs_total": len(hubs),
        "communities_spanned": len(spanned),
    }


# ------------------------------------------------------------------ single run
@dataclass
class SeedResult:
    seed: int
    num_events: int
    num_accounts: int
    positives: int
    hubs: list[str]
    mules: list[str]
    default: ConfusionMatrix
    hub_recall: float
    mule_recall: float
    scores: dict[str, float] = field(default_factory=dict)
    sweep: list[dict] = field(default_factory=list)
    rings: dict = field(default_factory=dict)
    unscored_positives: list[str] = field(default_factory=list)
    ground_truth_mismatch: list[str] = field(default_factory=list)


def evaluate_seed(seed: int, gen_args: dict | None = None) -> SeedResult:
    with tempfile.TemporaryDirectory(prefix=f"fraudeval_{seed}_") as tmp:
        out_dir = Path(tmp)
        csv_path = generate_dataset(seed, out_dir, **(gen_args or {}))
        events = load_events(csv_path)
        truth_file = json.loads((out_dir / "ground_truth.json").read_text())

    response = analyze(AnalyzeRequest(events=events))
    scores = {a.account_id: a.risk_score for a in response.accounts}

    truth = GroundTruth.from_file(truth_file)
    positives = truth.positives
    hubs = sorted(truth.hubs)
    mules = sorted(truth.mules)
    # Every account the generator declares must appear in the event log;
    # if one is missing from the scores, the labels and the data disagree.
    all_ids = {e.from_account_id for e in events} | {e.to_account_id for e in events}
    mismatch = sorted(p for p in positives if p not in all_ids)

    thr = threshold_for(DEFAULT_SENSITIVITY)
    sweep = []
    for i in range(SWEEP_POINTS):
        s = i / (SWEEP_POINTS - 1)
        t = threshold_for(s)
        cm = confusion_at(scores, t, positives)
        sweep.append({
            "sensitivity": round(s, 2),
            "threshold": round(t, 1),
            "flagged": cm.tp + cm.fp,
            **{k: v for k, v in cm.as_dict().items()},
            "hub_recall": recall_for(scores, t, hubs),
            "mule_recall": recall_for(scores, t, mules),
        })

    return SeedResult(
        seed=seed,
        num_events=response.num_events,
        num_accounts=response.num_accounts,
        positives=len(positives),
        hubs=hubs,
        mules=mules,
        scores=scores,
        default=confusion_at(scores, thr, positives),
        hub_recall=recall_for(scores, thr, hubs),
        mule_recall=recall_for(scores, thr, mules),
        sweep=sweep,
        rings=ring_metrics(response, truth),
        unscored_positives=sorted(p for p in positives if p not in scores),
        ground_truth_mismatch=mismatch,
    )


# ------------------------------------------------------------------ aggregate
def mean_range(values: Sequence[float]) -> dict:
    """Mean, stdev and min/max over seeds — a single lucky run proves nothing."""
    vals = list(values)
    return {
        "mean": statistics.fmean(vals),
        "stdev": statistics.stdev(vals) if len(vals) > 1 else 0.0,
        "min": min(vals),
        "max": max(vals),
    }


def aggregate(results: Sequence[SeedResult]) -> dict:
    def over(fn) -> dict:
        return mean_range([fn(r) for r in results])

    sweep_by_point = []
    for idx in range(len(results[0].sweep)):
        pts = [r.sweep[idx] for r in results]
        sweep_by_point.append({
            "sensitivity": pts[0]["sensitivity"],
            "threshold": pts[0]["threshold"],
            "precision": mean_range([p["precision"] for p in pts]),
            "recall": mean_range([p["recall"] for p in pts]),
            "f1": mean_range([p["f1"] for p in pts]),
            "hub_recall": mean_range([p["hub_recall"] for p in pts]),
            "flagged": mean_range([float(p["flagged"]) for p in pts]),
            "fp": mean_range([float(p["fp"]) for p in pts]),
        })

    return {
        "seeds": [r.seed for r in results],
        "dataset": {
            "events": over(lambda r: float(r.num_events)),
            "accounts": over(lambda r: float(r.num_accounts)),
            "positives": over(lambda r: float(r.positives)),
        },
        "default_threshold": threshold_for(DEFAULT_SENSITIVITY),
        "account_level": {
            "precision": over(lambda r: r.default.precision),
            "recall": over(lambda r: r.default.recall),
            "f1": over(lambda r: r.default.f1),
            "false_positive_rate": over(lambda r: r.default.false_positive_rate),
            "tp": over(lambda r: float(r.default.tp)),
            "fp": over(lambda r: float(r.default.fp)),
            "tn": over(lambda r: float(r.default.tn)),
            "fn": over(lambda r: float(r.default.fn)),
        },
        "hub_recall": over(lambda r: r.hub_recall),
        "mule_recall": over(lambda r: r.mule_recall),
        "ring_level": {
            "purity": over(lambda r: r.rings["purity"]),
            "coverage": over(lambda r: r.rings["coverage"]),
            "num_rings": over(lambda r: float(r.rings["num_rings"])),
            "top_ring_size": over(lambda r: float(r.rings["top_ring_size"])),
            "communities_spanned": over(lambda r: float(r.rings["communities_spanned"])),
            "hubs_in_top_ring": over(lambda r: float(r.rings["hub_in_top_ring"])),
        },
        "sweep": sweep_by_point,
        "integrity": {
            "unscored_positives": {r.seed: r.unscored_positives for r in results
                                   if r.unscored_positives},
            "ground_truth_mismatch": {r.seed: r.ground_truth_mismatch for r in results
                                      if r.ground_truth_mismatch},
        },
        "per_seed": [
            {
                "seed": r.seed,
                **r.default.as_dict(),
                "hub_recall": r.hub_recall,
                "mule_recall": r.mule_recall,
                "ring_purity": r.rings["purity"],
                "ring_coverage": r.rings["coverage"],
                "num_rings": r.rings["num_rings"],
            }
            for r in results
        ],
    }


# --------------------------------------------------------------------- report
def pct(x: float) -> str:
    return f"{100 * x:.1f}%"


def spread(stat: dict, as_pct: bool = True) -> str:
    if as_pct:
        return f"{pct(stat['mean'])} ± {100 * stat['stdev']:.1f} ({pct(stat['min'])}–{pct(stat['max'])})"
    return f"{stat['mean']:.1f} ± {stat['stdev']:.1f} ({stat['min']:.0f}–{stat['max']:.0f})"


def render_markdown(agg: dict) -> str:
    L: list[str] = []
    acc = agg["account_level"]
    L.append(f"Seeds: {', '.join(str(s) for s in agg['seeds'])} · "
             f"{agg['dataset']['accounts']['mean']:.0f} accounts / "
             f"{agg['dataset']['events']['mean']:.0f} events per run · "
             f"{agg['dataset']['positives']['mean']:.0f} planted positives.")
    L.append("")
    L.append(f"### Account level (default sensitivity 0.5 → risk ≥ {agg['default_threshold']:.0f})")
    L.append("")
    L.append("| Metric | Mean ± stdev (min–max) |")
    L.append("|---|---|")
    L.append(f"| Precision | {spread(acc['precision'])} |")
    L.append(f"| Recall | {spread(acc['recall'])} |")
    L.append(f"| F1 | {spread(acc['f1'])} |")
    L.append(f"| False positive rate | {spread(acc['false_positive_rate'])} |")
    L.append(f"| **Hub recall** | {spread(agg['hub_recall'])} |")
    L.append(f"| Mule recall | {spread(agg['mule_recall'])} |")
    L.append("")
    L.append("| Confusion cell | Mean count |")
    L.append("|---|---|")
    L.append(f"| True positives | {spread(acc['tp'], False)} |")
    L.append(f"| False positives | {spread(acc['fp'], False)} |")
    L.append(f"| True negatives | {spread(acc['tn'], False)} |")
    L.append(f"| False negatives | {spread(acc['fn'], False)} |")
    L.append("")
    L.append("### Threshold sweep (what the sensitivity slider actually does)")
    L.append("")
    L.append("| Sensitivity | Risk cut-off | Precision | Recall | F1 | Hub recall | Accounts flagged | False pos. |")
    L.append("|---|---|---|---|---|---|---|---|")
    for p in agg["sweep"]:
        L.append(
            f"| {p['sensitivity']:.1f} | ≥ {p['threshold']:.0f} | {pct(p['precision']['mean'])} | "
            f"{pct(p['recall']['mean'])} | {pct(p['f1']['mean'])} | {pct(p['hub_recall']['mean'])} | "
            f"{p['flagged']['mean']:.1f} | {p['fp']['mean']:.1f} |"
        )
    L.append("")
    ring = agg["ring_level"]
    L.append("### Ring level (top-ranked reported ring vs the planted ring)")
    L.append("")
    L.append("| Metric | Mean ± stdev (min–max) |")
    L.append("|---|---|")
    L.append(f"| Purity (share of top ring that is truly mule/hub) | {spread(ring['purity'])} |")
    L.append(f"| Coverage (share of planted ring inside that one ring) | {spread(ring['coverage'])} |")
    L.append(f"| Hubs inside the top ring | {spread(ring['hubs_in_top_ring'], False)} |")
    L.append(f"| Rings reported per run | {spread(ring['num_rings'], False)} |")
    L.append(f"| Top ring size | {spread(ring['top_ring_size'], False)} |")
    L.append(f"| Communities the planted ring was split across | {spread(ring['communities_spanned'], False)} |")
    L.append("")
    L.append("### Per-seed detail")
    L.append("")
    L.append("| Seed | Precision | Recall | F1 | Hub recall | Ring purity | Ring coverage | Rings |")
    L.append("|---|---|---|---|---|---|---|---|")
    for r in agg["per_seed"]:
        L.append(
            f"| {r['seed']} | {pct(r['precision'])} | {pct(r['recall'])} | {pct(r['f1'])} | "
            f"{pct(r['hub_recall'])} | {pct(r['ring_purity'])} | {pct(r['ring_coverage'])} | "
            f"{r['num_rings']} |"
        )
    integrity = agg["integrity"]
    if integrity["unscored_positives"] or integrity["ground_truth_mismatch"]:
        L.append("")
        L.append("### Integrity warnings")
        L.append("")
        for seed, accs in integrity["unscored_positives"].items():
            L.append(f"- Seed {seed}: planted accounts missing from engine output: {accs}")
        for seed, accs in integrity["ground_truth_mismatch"].items():
            L.append(f"- Seed {seed}: ground_truth.json declares accounts absent from the event log: {accs}")
    return "\n".join(L)


def render_text(agg: dict) -> str:
    acc = agg["account_level"]
    L = [
        "=" * 70,
        "FRAUD TRACKER — ENGINE ACCURACY EVALUATION",
        "=" * 70,
        f"Seeds            : {agg['seeds']}",
        f"Dataset per run  : {agg['dataset']['accounts']['mean']:.0f} accounts, "
        f"{agg['dataset']['events']['mean']:.0f} events, "
        f"{agg['dataset']['positives']['mean']:.0f} planted positives",
        f"Default cut-off  : risk_score >= {agg['default_threshold']:.0f} (slider at 0.5)",
        "",
        "ACCOUNT LEVEL",
        f"  precision      : {spread(acc['precision'])}",
        f"  recall         : {spread(acc['recall'])}",
        f"  F1             : {spread(acc['f1'])}",
        f"  FP rate        : {spread(acc['false_positive_rate'])}",
        f"  hub recall     : {spread(agg['hub_recall'])}",
        f"  mule recall    : {spread(agg['mule_recall'])}",
        f"  confusion      : TP {acc['tp']['mean']:.1f} | FP {acc['fp']['mean']:.1f} | "
        f"TN {acc['tn']['mean']:.1f} | FN {acc['fn']['mean']:.1f}",
        "",
        "RING LEVEL (top-ranked ring)",
        f"  purity         : {spread(agg['ring_level']['purity'])}",
        f"  coverage       : {spread(agg['ring_level']['coverage'])}",
        f"  hubs in ring   : {spread(agg['ring_level']['hubs_in_top_ring'], False)}",
        f"  communities    : {spread(agg['ring_level']['communities_spanned'], False)}",
        "",
        "THRESHOLD SWEEP",
        f"  {'sens':>5} {'cut':>5} {'prec':>7} {'recall':>7} {'F1':>7} {'hubrec':>7} {'flagged':>8} {'FP':>6}",
    ]
    for p in agg["sweep"]:
        L.append(
            f"  {p['sensitivity']:>5.1f} {p['threshold']:>5.0f} "
            f"{pct(p['precision']['mean']):>7} {pct(p['recall']['mean']):>7} "
            f"{pct(p['f1']['mean']):>7} {pct(p['hub_recall']['mean']):>7} "
            f"{p['flagged']['mean']:>8.1f} {p['fp']['mean']:>6.1f}"
        )
    integrity = agg["integrity"]
    if integrity["unscored_positives"] or integrity["ground_truth_mismatch"]:
        L += ["", "!! INTEGRITY WARNINGS !!"]
        for seed, accs in integrity["unscored_positives"].items():
            L.append(f"  seed {seed}: planted accounts absent from output: {accs}")
        for seed, accs in integrity["ground_truth_mismatch"].items():
            L.append(f"  seed {seed}: declared in ground_truth.json but absent from events: {accs}")
    return "\n".join(L)


def run(seeds: Sequence[int], gen_args: dict | None = None) -> dict:
    results = [evaluate_seed(seed, gen_args) for seed in seeds]
    return aggregate(results)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--seeds", type=int, nargs="+", default=list(DEFAULT_SEEDS))
    p.add_argument("--markdown", action="store_true", help="emit markdown tables")
    p.add_argument("--json", type=str, default=None, help="also dump raw metrics to this path")
    p.add_argument("--mules", type=int, default=None, help="override generator --mules")
    p.add_argument("--hubs", type=int, default=None, help="override generator --hubs")
    p.add_argument("--flag-rate", type=float, default=None, help="override generator --flag-rate")
    args = p.parse_args()

    gen_args = {k: v for k, v in
                (("mules", args.mules), ("hubs", args.hubs), ("flag_rate", args.flag_rate))
                if v is not None}

    agg = run(args.seeds, gen_args)
    print(render_markdown(agg) if args.markdown else render_text(agg))

    if args.json:
        Path(args.json).write_text(json.dumps(agg, indent=2))
        print(f"\nraw metrics -> {args.json}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
