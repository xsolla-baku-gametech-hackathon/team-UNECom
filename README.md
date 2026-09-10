# Post-Purchase Value Flow — Fraud Radar

**Team UNECom** — Xsolla Baku GameTech Hackathon 2026

Most fraud tools only look at the moment of payment. But stolen-card-funded
in-game currency, items and keys don't stay put — they get *laundered*
afterward, moving through trade, gift, marketplace and key-transfer between
accounts until they land somewhere cash-out-able. We built a tool that
traces that flow.

## What it does

Give it an event log (trade / gift / marketplace sale / key redeem /
purchase — CSV or JSON, drag-and-drop, zero setup) and it:

1. Builds a directed graph of value flow between accounts.
2. Scores every account on taint (how much flagged-payment money touched
   it), velocity (new account, high activity), and in/out-degree imbalance
   (classic "mule → hub" shape).
3. Clusters accounts into communities (Louvain) to surface whole fraud
   rings, not just single suspicious accounts.
4. Asks Claude to write a short, human-readable explanation for each
   flagged ring — evidence and a confidence level, never an automatic
   verdict. A human analyst always makes the final call.

Live dashboard: force-directed graph, adjustable sensitivity slider, and a
per-ring investigation panel with the AI explanation and a
confirm/dismiss decision.

## Architecture

```
data-generator/  synthetic fraud-ring dataset generator (Python)
        │  (CSV/JSON events — same shape the dashboard upload accepts)
        ▼
   web/  ── React + Vite + Tailwind dashboard
        │  POST /events (upload or, in production, a game's own backend
        │  pushing events live)
        ▼
   api/  ── Node + TypeScript + Fastify gateway, Prisma/SQLite
        │  proxies analysis requests to the engine
        ▼
engine/  ── Python + FastAPI
        graph_builder → risk_scoring (taint / velocity / degree
        imbalance) → community detection (rings) → Claude explanation
        layer (falls back to a template if no API key is set)
```

Full data contract: [docs/api-contract.md](./docs/api-contract.md).

## Running it locally

Four pieces, started in this order:

```bash
# 1. engine (port 8000)
cd engine
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # optional: add ANTHROPIC_API_KEY for real AI explanations
uvicorn app.main:app --reload --port 8000

# 2. api (port 3001)
cd api
npm install
cp .env.example .env
npm run prisma:push
npm run dev

# 3. web (port 5173)
cd web
npm install
npm run dev
```

Open `http://localhost:5173`. No backend running? The dashboard falls back
to a built-in mock scenario automatically, so the UI is always demoable.

Want real data instead of the bundled sample? `data-generator/generate.py`
produces a fresh synthetic dataset (`data-generator/output/events.csv`) —
drag it onto the upload panel.

## Docs

- [docs/pitch-outline.md](./docs/pitch-outline.md) — pitch slide structure
- [docs/demo-script.md](./docs/demo-script.md) — minute-by-minute demo script
- [docs/api-contract.md](./docs/api-contract.md) — shared event schema across all four services

## Team

Nezrin Ceferova · Aslan Musayev · Sardar Soltanzade · Hamid Aslanov · Matin Mehdi

## Hackathon ground rules (from the organizers)

- All work happens in this public repo during the official build window
  (Sept 10–11).
- Commit history should reflect real, meaningful progress — no artificially
  inflated commit counts.
- No confidential or proprietary Xsolla data is used anywhere in this
  project; all data is synthetic.
