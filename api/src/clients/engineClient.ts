import { config } from "../config.js";

// Mirrors engine/app/schema.py (Pydantic). That file is the source of
// truth — keep this in sync if it changes.
export interface EngineEvent {
  event_id: string;
  type: string;
  timestamp: string;
  from_account_id: string;
  to_account_id: string;
  asset_type: string;
  asset_id: string;
  quantity: number;
  value_usd_estimate: number;
  payment_flagged: boolean;
  account_created_at: string | null;
}

// risk_score is 0-100 (see engine/app/risk_scoring.py's combine_scores,
// capped at min(risk, 100.0)) — NOT 0-1. Normalize before handing it to
// anything that expects a 0-1 scale (GraphSnapshot).
export interface EngineAccountResult {
  account_id: string;
  in_degree: number;
  out_degree: number;
  in_value_usd: number;
  out_value_usd: number;
  taint_score: number;
  velocity_score: number;
  imbalance_score: number;
  risk_score: number;
  community_id: number | null;
  flags: string[];
}

export interface EngineRingResult {
  ring_id: string;
  account_ids: string[];
  size: number;
  risk_score: number;
  avg_taint_score: number;
  flagged_purchase_count: number;
  total_value_usd: number;
  hub_candidates: string[];
}

export interface EngineAnalyzeResponse {
  analysis_id: string;
  generated_at: string;
  num_events: number;
  num_accounts: number;
  accounts: EngineAccountResult[];
  rings: EngineRingResult[];
}

export interface EngineExplainResponse {
  ring_id: string;
  explanation: string;
  ai_generated: boolean;
  evidence: Record<string, unknown>;
}

export class EngineError extends Error {
  constructor(message: string, public readonly cause?: unknown, public readonly statusCode = 502) {
    super(message);
    this.name = "EngineError";
  }
}

async function request<T>(path: string, init?: RequestInit, timeoutMs = config.engineTimeoutMs): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${config.engineUrl}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new EngineError(`engine responded with ${res.status}`, undefined, res.status);
    }
    return await res.json() as T;
  } catch (err) {
    if (err instanceof EngineError) throw err;
    throw new EngineError(controller.signal.aborted ? "engine request timed out" : "failed to reach engine service", err, controller.signal.aborted ? 504 : 502);
  } finally {
    clearTimeout(timeout);
  }
}

// Talks to the Python fraud-detection engine (/engine). Contract per
// engine/README.md and engine/app/main.py.
export const engineClient = {
  // POST /analyze { events } -> AnalyzeResponse. The engine caches the
  // result in-memory keyed by the returned analysis_id; "most recent" is
  // also tracked server-side and used by /explain when no id is given.
  analyze(events: EngineEvent[]): Promise<EngineAnalyzeResponse> {
    return request("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
  },

  // GET /explain/{ring_id}?analysis_id=... -> ExplainResponse. Always pass
  // the analysis_id from a just-made analyze() call rather than relying on
  // the engine's "latest analysis" fallback, so we're never explaining a
  // stale/unrelated dataset another caller last analyzed.
  explain(ringId: string, analysisId: string): Promise<EngineExplainResponse> {
    const query = new URLSearchParams({ analysis_id: analysisId });
    return request(`/explain/${encodeURIComponent(ringId)}?${query}`, undefined, config.engineExplainTimeoutMs);
  },
};
