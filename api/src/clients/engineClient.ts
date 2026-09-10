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
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "EngineError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.engineTimeoutMs);

  let res: Response;
  try {
    res = await fetch(`${config.engineUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    throw new EngineError("failed to reach engine service", err);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new EngineError(`engine responded with ${res.status}`);
  }

  return (await res.json()) as T;
}

// Talks to the Python fraud-detection engine (/engine). As of this writing
// the engine only has its Pydantic schema (engine/app/schema.py) — no
// FastAPI routes are wired up yet — so this client is written against that
// schema. See api/README.md for the full assumed contract.
export const engineClient = {
  // POST /analyze with { events }, matching AnalyzeRequest -> AnalyzeResponse.
  analyze(events: EngineEvent[]): Promise<EngineAnalyzeResponse> {
    return post("/analyze", { events });
  },

  // POST /explain with { ring_id, events } -> ExplainResponse. The engine
  // needs the events to regenerate the ring's context for its Claude call
  // (per requirements.txt's anthropic dependency) since ExplainResponse
  // alone isn't enough to identify which accounts/events the ring covers.
  explain(ringId: string, events: EngineEvent[]): Promise<EngineExplainResponse> {
    return post("/explain", { ring_id: ringId, events });
  },
};
