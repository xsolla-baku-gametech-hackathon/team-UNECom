export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  engineUrl: (process.env.ENGINE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
  engineExplainTimeoutMs: Number(process.env.ENGINE_EXPLAIN_TIMEOUT_MS ?? 30000),
  engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? 5000),

  // Wipes every ingested event and every analyst decision. Opt-in, and off
  // unless explicitly enabled, because the database is now a shared Neon
  // instance rather than a file on one laptop — a deployed build must never
  // hand a visitor a button that empties it for everyone.
  allowDemoReset: process.env.ALLOW_DEMO_RESET === "true",
};
