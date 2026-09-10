# /api

Node.js + TypeScript + Fastify backend for the post-purchase value flow fraud
detection tool. Ingests events, stores them in SQLite (Prisma), and proxies
risk/ring analysis to the Python `/engine` service.

Layered as `routes/` (HTTP) → `services/` (business logic) →
`repositories/` (DB access) + `clients/` (external HTTP, currently just the
engine).

## Running it

```bash
cd api
npm install
cp .env.example .env      # defaults are fine for local dev
npm run prisma:push       # creates api/prisma/dev.db from prisma/schema.prisma
npm run dev                # http://localhost:3001, auto-reload
```

Env vars (`.env`):

| Var | Default | Meaning |
|---|---|---|
| `PORT` | `3001` | API listen port |
| `DATABASE_URL` | `file:./dev.db` | SQLite file |
| `ENGINE_URL` | `http://localhost:8000` | Base URL of `/engine` |
| `ENGINE_TIMEOUT_MS` | `5000` | Abort engine calls after this long |

## Engine contract

`/api` calls two real, live-verified `/engine` routes (see `engine/README.md`
for the full engine-side docs):

- `POST /analyze` — body `{ events: Event[] }` → `AnalyzeResponse`
  (`{ analysis_id, generated_at, num_events, num_accounts,
  accounts: AccountResult[], rings: RingResult[] }`). The engine caches the
  result in-memory keyed by `analysis_id`.
- `GET /explain/{ring_id}?analysis_id=...` → `ExplainResponse`
  (`{ ring_id, explanation, ai_generated, evidence }`). We always call
  `/analyze` immediately before this to get a fresh `analysis_id`, rather
  than relying on the engine's "most recent analysis" fallback — otherwise
  we could end up explaining a stale/unrelated dataset some other caller
  last analyzed.

**`risk_score` is 0–100 on the engine** (see
`engine/app/risk_scoring.py`), not 0–1. `GET /accounts/:id/risk` and
`GET /rings` pass the engine's numbers through as-is (raw 0–100 scale,
snake_case field names) — `GET /graph` is the one place we normalize to
0–1, since that's what `web/src/lib/types.ts`'s `GraphSnapshot.riskScore`
expects.

If the engine's routes change, `api/src/clients/engineClient.ts` is the
only place that needs updating.

## Endpoints

### `POST /events`

Ingests events matching the shared data contract. Body is a single event
object **or** an array (batch upload — e.g.
`data-generator/output/events.json`). Duplicate `event_id`s are silently
skipped (safe to re-upload/replay a batch).

```json
{
  "event_id": "evt_...", "type": "trade", "timestamp": "2026-09-10T10:00:00Z",
  "from_account_id": "acct_0001", "to_account_id": "acct_0002",
  "asset_type": "currency", "asset_id": "gold_coins", "quantity": 500,
  "value_usd_estimate": 9.99, "payment_flagged": false,
  "account_created_at": "2026-06-01T00:00:00Z"
}
```

→ `201 { "received": 1, "inserted": 1, "skipped": 0 }`, or `400` with zod
validation details on a bad payload.

### `GET /graph`

**What `/web`'s `fetchGraph()` calls.** Full dashboard snapshot — one
engine `analyze()` call, reshaped into `GraphSnapshot`
(`web/src/lib/types.ts`):

```json
{
  "generatedAt": "...",
  "accounts": [{ "id": "acct_0001", "label": "acct_0001", "createdAt": "...|null", "riskScore": 0.12, "ringId": "ring_001|null" }],
  "events": [{ "id": "evt_...", "type": "trade", "timestamp": "...", "from": "...", "to": "...", "assetType": "currency", "assetId": "...", "quantity": 1, "valueUsdEstimate": 9.99, "paymentFlagged": false }],
  "rings": [{ "id": "ring_001", "memberAccountIds": [...], "hubAccountIds": [...], "riskScore": 0.91, "status": "pending", "signals": ["..."], "totalValueUsd": 1234.56 }],
  "stats": { "activeAccounts": 1, "dailyEvents": 533, "dailyVolumeUsd": 19371.57, "ringsAtRisk": 1 }
}
```

- `accounts[].createdAt` comes from the event contract's convention that
  `account_created_at` is always `from_account_id`'s own signup date.
- `accounts[].ringId` / `rings[].memberAccountIds` come from the engine's
  ring membership.
- `rings[].status` is `"pending"` unless a decision was saved via
  `POST /rings/:id/decision`.
- `rings[].signals` are short Azerbaijani strings phrased here from the
  engine's numeric `RingResult` fields (size, avg_taint_score,
  flagged_purchase_count, hub_candidates, total_value_usd) — the engine
  itself doesn't return prose.
- `stats.dailyEvents` / `dailyVolumeUsd` are over the trailing 24h from
  stored events; `activeAccounts` / `ringsAtRisk` are just the accounts /
  rings counts the engine returned.

502 `engine_unreachable` if the engine can't be reached.

### `GET /accounts/:id/risk`

Runs the same engine `analyze()` and returns that account's
`AccountResult` as-is (engine field names, snake_case, **`risk_score` is
0–100**). `404 account_not_found` if the account has no events; `502
engine_unreachable` if the engine is down.

### `GET /rings`

Same engine call, returns the `RingResult[]` list (engine field names,
**`risk_score` 0–100**), each with a `sensitivity` field merged in from
`POST /rings/:id/sensitivity` (`null` if never set). `502
engine_unreachable` if the engine is down.

### `POST /rings/:id/sensitivity`

Designer-tunable per-ring sensitivity override (distinct from `/web`'s
client-side global sensitivity slider — that one never hits the backend).
Body `{ "sensitivity": 0.75 }` (0–1). Persists locally, doesn't touch the
engine. → `{ "ring_id": "...", "sensitivity": 0.75, "updated_at": "..." }`.

### `GET /rings/:id/explanation`

**What `/web`'s `fetchExplanation()` calls.** Proxies the engine's
`/explain` (Claude-generated; falls back to a template if the engine has
no `ANTHROPIC_API_KEY` — either way it never errors). → `RingExplanation`:

```json
{ "ringId": "ring_001", "summary": "...", "signals": [{ "label": "...", "value": "..." }], "recommendedAction": "..." }
```

502 `engine_unreachable` if the engine is down (the frontend already
falls back to its local mock explanation on any failure).

### `POST /rings/:id/decision`

**What `/web`'s `submitDecision()` calls.** Body
`{ "decision": "real" | "fraud" }` → stores `confirmed_real` /
`confirmed_fraud`, reported back by `GET /graph` as that ring's `status`.
Doesn't touch the engine. → `{ "ring_id": "...", "status": "confirmed_fraud", "decided_at": "..." }`.

## Data model (`prisma/schema.prisma`)

- `Event` — mirrors the shared contract field-for-field.
- `RingSensitivity` — designer's per-ring sensitivity override.
- `RingDecision` — analyst's real/fraud verdict per ring.

Ring detection itself is **not** stored here — `/rings` and `/graph` always
ask the engine fresh. Only our two local overrides persist independently.
