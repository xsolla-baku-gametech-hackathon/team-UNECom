# Engine Accuracy — Measured

Every number on this page comes from `engine/eval/evaluate.py`, run against the
synthetic dataset produced by `data-generator/generate.py`. Nothing here is
estimated, rounded up, or taken from a slide. Reproduce it with:

```bash
cd engine
.venv/bin/python -m eval.evaluate --seeds 42 43 44 45 46
```

The harness imports `app.main.analyze` directly — the same function the HTTP
API calls — so these are the scores the live demo produces, not a
reimplementation.

## Method

**Ground truth.** The generator plants a fraud ring and records which accounts
it planted in `ground_truth.json`. Account ids carry no label: every account,
planted or clean, is an opaque `acct_NNNN` with the numbers shuffled, so
nothing on screen, in the engine, or in the Claude explanation layer can read
the answer off a name.

| Class in `ground_truth.json` | Label | Behaviour |
|---|---|---|
| `mule_accounts` | positive | buys from STORE with a (usually) flagged card, forwards the value within minutes |
| `hub_accounts` | positive | cash-out hub; only ever *receives* ring value, never flags a purchase itself |
| everything else | negative | background trade/gift/marketplace activity, ~1% random flag rate |

The harness takes labels only from `ground_truth.json`. Renaming every account
left every metric below unchanged to the last decimal, which is the direct
check that scoring does not depend on ids. A planted account missing from the
event log is reported as an integrity warning rather than silently averaged away.

**Threshold.** The UI sensitivity slider maps to a risk cut-off by
`threshold = 100 × (0.92 − 0.72 × sensitivity)` (`web/src/lib/colors.ts`). The
slider ships at 0.5, so "default" throughout this document means **risk ≥ 56**.

**Seeds.** Five different generator seeds; every figure is reported as
mean ± stdev with the min–max range, so a single lucky dataset cannot carry
the result.

## Results

Seeds: 42, 43, 44, 45, 46 · 352 accounts / 2624 events per run · 52 planted positives.

### Account level (default sensitivity 0.5 → risk ≥ 56)

| Metric | Mean ± stdev (min–max) |
|---|---|
| Precision | 100.0% ± 0.0 (100.0%–100.0%) |
| Recall | 64.6% ± 5.5 (55.8%–69.2%) |
| F1 | 78.4% ± 4.2 (71.6%–81.8%) |
| False positive rate | 0.0% ± 0.0 (0.0%–0.0%) |
| **Hub recall** | 0.0% ± 0.0 (0.0%–0.0%) |
| Mule recall | 67.2% ± 5.8 (58.0%–72.0%) |

| Confusion cell | Mean count |
|---|---|
| True positives | 33.6 ± 2.9 (29–36) |
| False positives | 0.0 ± 0.0 (0–0) |
| True negatives | 300.0 ± 0.0 (300–300) |
| False negatives | 18.4 ± 2.9 (16–23) |

### Threshold sweep (what the sensitivity slider actually does)

| Sensitivity | Risk cut-off | Precision | Recall | F1 | Hub recall | Accounts flagged | False pos. |
|---|---|---|---|---|---|---|---|
| 0.0 | ≥ 92 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0 | 0.0 |
| 0.1 | ≥ 85 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0 | 0.0 |
| 0.2 | ≥ 78 | 0.0% | 0.0% | 0.0% | 0.0% | 0.0 | 0.0 |
| 0.3 | ≥ 70 | 100.0% | 5.4% | 10.2% | 0.0% | 2.8 | 0.0 |
| 0.4 | ≥ 63 | 100.0% | 63.1% | 77.2% | 0.0% | 32.8 | 0.0 |
| 0.5 | ≥ 56 | 100.0% | 64.6% | 78.4% | 0.0% | 33.6 | 0.0 |
| 0.6 | ≥ 49 | 100.0% | 68.1% | 80.9% | 20.0% | 35.4 | 0.0 |
| 0.7 | ≥ 42 | 100.0% | 72.3% | 83.9% | 70.0% | 37.6 | 0.0 |
| 0.8 | ≥ 34 | 100.0% | 74.2% | 85.2% | 100.0% | 38.6 | 0.0 |
| 0.9 | ≥ 27 | 98.0% | 88.8% | 93.2% | 100.0% | 47.2 | 1.0 |
| 1.0 | ≥ 20 | 85.4% | 100.0% | 92.1% | 100.0% | 61.0 | 9.0 |

### Ring level (top-ranked reported ring vs the planted ring)

| Metric | Mean ± stdev (min–max) |
|---|---|
| Purity (share of top ring that is truly mule/hub) | 94.9% ± 4.0 (90.7%–100.0%) |
| Coverage (share of planted ring inside that one ring) | 80.0% ± 11.5 (71.2%–100.0%) |
| Hubs inside the top ring | 1.2 ± 0.4 (1–2) |
| Rings reported per run | 1.8 ± 0.4 (1–2) |
| Top ring size | 44.0 ± 7.5 (38–57) |
| Communities the planted ring was split across | 1.8 ± 0.4 (1–2) |

### Per-seed detail

| Seed | Precision | Recall | F1 | Hub recall | Ring purity | Ring coverage | Rings |
|---|---|---|---|---|---|---|---|
| 42 | 100.0% | 63.5% | 77.6% | 0.0% | 90.7% | 75.0% | 2 |
| 43 | 100.0% | 69.2% | 81.8% | 0.0% | 95.1% | 75.0% | 2 |
| 44 | 100.0% | 65.4% | 79.1% | 0.0% | 97.4% | 71.2% | 2 |
| 45 | 100.0% | 69.2% | 81.8% | 0.0% | 100.0% | 78.8% | 2 |
| 46 | 100.0% | 55.8% | 71.6% | 0.0% | 91.2% | 100.0% | 1 |

## What these numbers say

**Precision is not the interesting number.** 100% precision with zero false
positives across five seeds sounds excellent, and it is genuinely the
correct answer *on this dataset* — but the reason is that the synthetic clean
population contains almost nothing that looks like a mule. The highest-scoring
clean account in seed 42 reaches 31.2, well under the 56 cut-off, and the whole
clean distribution sits below 32. A real player base contains traders,
resellers and gifting guilds that would crowd that gap. **Read the 100% as
"the planted ring is separable in this dataset", not as a false-positive rate
we can promise a studio.**

**Recall at the default setting is 64.6%, and that is the honest headline.**
Roughly a third of planted mules are missed at the shipped slider position.

**Hub recall at the default setting is 0%.** This is the most important finding
in this document, because catching cash-out hubs is our core differentiating
claim, and at the setting the demo opens on we catch none of them. Hubs only
appear once the slider is pushed to ~0.7 (70%) and are fully recovered at 0.8
(100%).

The mechanism is visible in the score components (seed 42):

| Account | risk | taint | velocity | imbalance | in/out degree |
|---|---|---|---|---|---|
| hub A | 45.6 | 0.630 | 0.005 | 0.689 | 38 / 7 |
| hub B | 41.0 | 0.792 | 0.004 | 0.200 | 12 / 8 |

Two structural reasons, both in the scoring design rather than in any bug:

1. **Velocity is 25% of the score and hubs score ~0 on it by construction.**
   `velocity_score` measures how fast an account transacts *after being
   created*. Hubs are aged accounts (80–120 days old in the generator), which
   is exactly what a real cash-out hub looks like. A hub therefore forfeits a
   quarter of the available score before anything else is considered. The
   maximum a hub can reach is 75, and in practice it lands in the low 40s.
2. **Hub cash-out sales erode the very signal meant to identify hubs.**
   Hub B has an imbalance of 0.200, below the 0.3 `IMBALANCE_HUB_THRESHOLD`,
   so it does not even earn the `hub-pattern` flag. Its outgoing marketplace
   sales — the cash-out step, i.e. the fraudulent behaviour itself — push
   in/out degree back toward balance and *lower* its risk score.

**Recall is close to a linear function of the payment-processor flag rate.**
This is the engine's single biggest dependency. Holding everything else fixed
and varying only the generator's `--flag-rate` (3 seeds each):

| Generator flag rate | Overall recall | Mule recall | Hub recall |
|---|---|---|---|
| 0.3 | 20.5% | 21.3% | 0.0% |
| 0.7 (default) | 64.6% | 67.2% | 0.0% |
| 1.0 | 98.1% | 100.0% | 50.0% |

`taint` carries 40% of the score and is the only signal that fires on the
*financial* nature of the fraud. A mule whose source purchase was never
flagged scores on velocity alone (max 25) and cannot clear the default cut-off:
12 of the 17 missed mules in seed 42 have `taint_score == 0.0`. In effect, the
engine's account-level detection currently amplifies the payment processor's
existing signal more than it replaces it. Its independent contribution is the
*graph* — which accounts the flagged money reached — and that is what the ring
metrics below actually measure.

**Ring detection is the strongest result.** Louvain recovers the planted ring
as one dominant community: the top-ranked ring is 94.9% pure and holds 80.0% of
all planted accounts, and in 4 of 5 seeds the ring is split across at most 2
communities. Ring-level output is where the tool earns its keep, and it holds
up even where account-level recall does not — the ring is found even when
individual members score below the cut-off, because ring membership comes from
graph structure rather than from the risk threshold.

**The slider is monotonic and does what it claims.** Recall rises from 0% to
100% across the range while precision holds at 100% until sensitivity 0.9,
then degrades to 85.4% at maximum. Sensitivity below 0.3 flags nothing at all:
the highest-scoring account across all five seeds reaches only 72.8, while
those slider positions demand 78, 85 and 92 — so the top third of the slider's
travel is dead space in practice. There is a genuine, visible precision/recall
trade-off in the 0.8–1.0 band, which is the range worth demoing.

## Known weaknesses, in priority order

1. **Hubs are invisible at the default sensitivity (0% recall).** The demo
   should either open at sensitivity 0.8 or the scoring weights should stop
   charging aged accounts a 25% velocity penalty. Not changed here — changing
   scoring to improve the metric would invalidate the metric.
2. **Detection is dependent on `payment_flagged`.** Recall collapses to ~20%
   when only 30% of fraudulent purchases are flagged upstream.
3. **`IMBALANCE_HUB_THRESHOLD = 0.3` is not reached by a hub that cashes out
   actively.** The more a hub launders, the less hub-like it scores.
4. **Sensitivity 0.0–0.2 is dead travel** — the maximum score observed across
   five seeds is 72.8, below the 78/85/92 cut-offs those positions demand.

These are reported, not fixed. `engine/app/` is untouched by this work.

## Limitations — read this before quoting any number above

**This measurement is performed on synthetic data, and the ground truth is a
fraud ring that we planted ourselves.** The generator writes the mules, writes
the hubs, and writes the behaviour the engine then looks for. These numbers are
therefore **not a claim of real-world accuracy**. They are a measure of the
system's internal consistency: they show that the pipeline recovers the
structure it was designed to recover, that the sensitivity slider behaves
monotonically and predictably, and that changes to the scoring math can be
detected as regressions.

Specifically, the figures above **cannot** be used to claim:

- a false-positive rate on a real player base — our synthetic clean population
  has no power traders, guild banks, resellers or gifting chains, which are
  precisely the legitimate patterns that would generate false positives;
- that a real cash-out ring would be structured like the planted one — real
  rings adapt, layer more deeply, and mix in legitimate traffic on purpose;
- that a real payment processor flags 70% of fraudulent purchases, which the
  results above show is the dominant driver of recall.

Validating against a real, labelled incident dataset from a live game economy
is the necessary next step, and it has not been done. Any accuracy claim we
make to a studio should be framed as "here is the methodology and here is how
it performs on data where we know the answer", never as a headline percentage.

## Regression guard

`engine/tests/test_evaluation_regression.py` pins these measurements as floors
(recall ≥ 50%, precision ≥ 90%, ring purity ≥ 80%, ring coverage ≥ 60%, hub
recall at sensitivity 0.8 ≥ 90%) and asserts the slider stays monotonic. The
floors sit deliberately below the measured values: they catch regressions, they
do not describe current performance. A scoring change that legitimately moves a
number should update the floor and this document in the same commit.

```bash
cd engine && .venv/bin/python -m pytest tests/test_evaluation_regression.py -q
```
