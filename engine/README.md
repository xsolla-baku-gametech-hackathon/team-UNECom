# Fraud Detection Engine (/engine)

Graph-based risk scoring engine for post-purchase value flow. It detects how
in-game currency, items and keys bought with stolen cards get "laundered"
between accounts through trades, gifts, marketplace sales and key transfers
(farming rings).

This README is **for the `/api` team**: it explains how to call the engine.

## Quick start

```bash
cd engine
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# (optional; without it the template explanation is used)
export ANTHROPIC_API_KEY=sk-ant-...

uvicorn app.main:app --reload --port 8000
```

Health check: `curl http://localhost:8000/health` → `{"status":"ok"}`

## Tests

Unit tests for the risk scoring formulas (taint propagation, velocity, degree
imbalance), graph construction and the explanation evidence (`tests/`):

```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```

Try it with the bundled sample data:

```bash
curl -s -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  --data @sample_data/analyze_request.json | python3 -m json.tool | less
```

(`sample_data/ground_truth.json` lists which accounts form the real farming
ring in that sample. The engine does NOT read it; it is only for checking the
result.)

To create your own dataset: `../data-generator/generate.py` (see its usage in
that folder).

## Data contract

The whole team builds on this event format (do not change it):

```json
{
  "event_id": "evt_...",
  "type": "trade | gift | marketplace_sale | key_redeem | purchase",
  "timestamp": "2026-09-09T10:16:25Z",
  "from_account_id": "acct_0123",
  "to_account_id": "acct_0456",
  "asset_type": "currency | item | key",
  "asset_id": "gold_coins",
  "quantity": 250,
  "value_usd_estimate": 12.5,
  "payment_flagged": false,
  "account_created_at": "2026-09-08T03:00:00Z"
}
```

**Convention:** `account_created_at` is always the creation time of
`from_account_id` (i.e. when the account now sending value was opened). In
`purchase` events `from_account_id` is the system account `STORE`, which has
no creation time (`account_created_at: null`).

## Endpoints

### `POST /analyze`

Request body:

```json
{ "events": [ /* list of Event objects, per the contract above */ ] }
```

Response (`AnalyzeResponse`):

```json
{
  "analysis_id": "an_a47d710f3a07",
  "generated_at": "2026-09-10T11:30:00Z",
  "num_events": 2626,
  "num_accounts": 352,
  "accounts": [
    {
      "account_id": "acct_0214",
      "in_degree": 2, "out_degree": 3,
      "in_value_usd": 264.27, "out_value_usd": 330.66,
      "taint_score": 1.0,
      "velocity_score": 1.0,
      "imbalance_score": 0.0,
      "risk_score": 71.52,
      "community_id": 10,
      "flags": ["tainted-funds", "flagged-purchase-source", "fast-account-fast-spend"]
    }
  ],
  "rings": [
    {
      "ring_id": "ring_10",
      "account_ids": ["acct_0044", "acct_0117", "..."],
      "size": 43,
      "risk_score": 50.02,
      "avg_taint_score": 0.5857,
      "flagged_purchase_count": 25,
      "total_value_usd": 8376.36,
      "hub_candidates": ["acct_0044", "acct_0272", "acct_0236"]
    }
  ]
}
```

`accounts` is sorted by risk_score, highest first. `rings` only lists
communities that are large enough (≥3 accounts) AND risky enough (average
risk ≥15); not every community counts as a ring.

Every `POST /analyze` call keeps its result in process memory (the 32 most
recent) and returns an `analysis_id`. The latest analysis is the default
"active" one (see below).

### `GET /explain/{ring_id}?analysis_id=...`

`ring_id` is a `rings[].ring_id` from the `/analyze` response (e.g.
`ring_10`). `analysis_id` is **optional**; without it the latest `/analyze`
result is used (enough for a single-analyst demo).

Response (`ExplainResponse`):

```json
{
  "ring_id": "ring_10",
  "explanation": "These 43 accounts sit in one community and route most of their value to acct_0044. Account acct_0044 collects from 38 inbound links worth $5,860.70 while sending out only $533.24, a typical collection point (high likelihood).",
  "ai_generated": true,
  "evidence": { "...": "structured evidence sent to Claude, including hub_candidate_details" }
}
```

If `ai_generated` is `false`, `ANTHROPIC_API_KEY` was not found (or the
Claude call failed twice) and a template explanation is returned. The
endpoint never errors because of Claude.

### `GET /health`

`{"status": "ok"}` for liveness.

## How risk scoring works

Four signals are computed per account and combined with weights into a 0-100
`risk_score`:

| Signal | What it measures | Weight |
|---|---|---|
| `taint_score` | How much of the value the account received originates in `payment_flagged=true` purchases, propagated along the graph with "haircut tainting" (a standard crypto-forensics method) | 0.40 |
| `velocity_score` | How soon after creation the account made its first outgoing transfer (new + immediately active = suspicious) | 0.25 |
| `imbalance_score` | In/out-degree imbalance (many in, few out = hub-like) | 0.20 |
| `community_risk` | Average risk of the account's community (Louvain community detection) | 0.15 |

Communities (`rings`) are found in the transfer graph with the Louvain
algorithm (NetworkX's built-in `louvain_communities`, no extra dependency),
then each community is scored as a ring from its average risk, flagged
purchase count and total value.

## Notes for the `/api` team

- State lives in process memory only: a server restart loses every
  analysis. Enough for a hackathon prototype; production needs storage.
- CORS is open to every origin (for demo speed).
- Without `ANTHROPIC_API_KEY`, `/explain` still works and returns template
  text instead of an AI explanation (`ai_generated: false`).
- The model can be changed with the `CLAUDE_MODEL` environment variable
  (default: `claude-sonnet-5`).
