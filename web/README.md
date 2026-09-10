# Fraud Radar dashboard

React + TypeScript + Vite + Tailwind dashboard for investigating post-purchase value flow.

## Run locally

Start the Python engine on port 8000 and the API on port 3001, then:

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api` to http://localhost:3001.
Set `VITE_API_PROXY_TARGET` to change the development proxy, or
`VITE_API_BASE_URL` at build time for a separately hosted production API.

## Investigation flow

Upload CSV or JSON, select a case, inspect its evidence, then press F (fraud)
or R (real player) followed by Enter. J/K navigate, / searches, Escape closes
the current action. No accounts are automatically blocked.

Counters show all loaded events and estimated volume, including purchases,
regardless of date. Sensitivity controls the ring risk threshold. Per-case
overrides currently last only for the browser session.

Flagged-ring explanations are prefetched and shared with the panel. The web
request allows 35 seconds; the API explanation request allows 30 seconds.
The panel distinguishes Claude, template, and demo explanations. Live failures
do not substitute demo explanations or pretend decisions were saved.
An initial graph failure opens labelled demo mode; uploads require the API.

`public/sample-events.json` is the canonical 388-event pitch dataset. Uploading
it after its matching CSV skips existing IDs. The generator's default output
is a larger evaluation dataset.

## Checks

```bash
npm run build
npm run lint
```

See `../engine/README.md` for engine tests and `../docs/accuracy.md` for evaluation.

## Browser regression rehearsal

`tests/rehearsal.mjs` drives real Chrome through its debugging protocol,
including CSV upload, prefetch, decisions, and simulated connection failures.
It requires a running web/API/engine stack with an **isolated empty database**;
it asserts the database is empty and never resets it. It leaves test data in
that isolated database. Run from the repository root:

```bash
google-chrome --headless --remote-debugging-port=9227 --user-data-dir=/tmp/unecom-browser-test
REHEARSAL_URL=http://localhost:5173 node web/tests/rehearsal.mjs
```

The local canonical `data-generator/output/events.csv` must be present.
`CHROME_DEBUG_URL` defaults to `http://127.0.0.1:9227`.
Screenshots are written to `/tmp/unecom-rehearsal*.png`.
