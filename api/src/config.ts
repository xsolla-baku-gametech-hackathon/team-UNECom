// Every numeric setting goes through readNumber so a typo in .env cannot
// become NaN: Number("5ooo") is NaN, setTimeout(fn, NaN) fires at once, and
// every engine call would then time out instantly with no hint why.
export function readNumber(name: string, fallback: number, env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number, got "${raw}"`);
  }
  return value;
}

export const config = {
  port: readNumber("PORT", 3001),
  host: process.env.HOST ?? "0.0.0.0",
  engineUrl: (process.env.ENGINE_URL ?? "http://localhost:8000").replace(/\/+$/, ""),
  engineExplainTimeoutMs: readNumber("ENGINE_EXPLAIN_TIMEOUT_MS", 30000),
  engineTimeoutMs: readNumber("ENGINE_TIMEOUT_MS", 5000),
  // Fastify's default body limit is 1 MiB, which a POST /events batch hits at
  // ~3,400 events (~310 bytes each) — a real studio export is larger than the
  // demo file. 16 MiB is ~50,000 events.
  bodyLimitBytes: readNumber("BODY_LIMIT_BYTES", 16 * 1024 * 1024),

  // Wipes every ingested event and every analyst decision. Opt-in, and off
  // unless explicitly enabled, because the database is now a shared Neon
  // instance rather than a file on one laptop — a deployed build must never
  // hand a visitor a button that empties it for everyone.
  allowDemoReset: process.env.ALLOW_DEMO_RESET === "true",
};
