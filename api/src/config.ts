export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  engineUrl: (process.env.ENGINE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
  engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? 5000),
  // /explain makes a Claude API call on the engine side and takes 10-15s
  // for a typical ring; the analyze timeout above would abort it every time.
  engineExplainTimeoutMs: Number(process.env.ENGINE_EXPLAIN_TIMEOUT_MS ?? 30000),
};
