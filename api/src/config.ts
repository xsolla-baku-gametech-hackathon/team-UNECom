export const config = {
  port: Number(process.env.PORT ?? 3001),
  host: process.env.HOST ?? "0.0.0.0",
  engineUrl: (process.env.ENGINE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
  engineExplainTimeoutMs: Number(process.env.ENGINE_EXPLAIN_TIMEOUT_MS ?? 30000),
  engineTimeoutMs: Number(process.env.ENGINE_TIMEOUT_MS ?? 5000),
};
