// Talks to the /api gateway described in /docs/api-contract.md. Falls back
// to local mock data whenever the backend isn't reachable yet, so the
// dashboard is always demoable regardless of backend build status.
import { buildMockExplanation, buildMockSnapshot } from "./mockData";
import type { RawEvent } from "./parseUpload";
import type { GraphSnapshot, RingExplanation } from "./types";

export type Decision = "real" | "fraud";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const FETCH_TIMEOUT_MS = 1500;
const UPLOAD_TIMEOUT_MS = 10000; // a judge's own export can be large
const EXPLAIN_TIMEOUT_MS = 30000; // the engine calls Claude for this one: 10-15s is normal

let usingMock = false;
export function isUsingMockData() {
  return usingMock;
}

async function timedFetch(path: string, init?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
    }
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

let cachedSnapshot: GraphSnapshot | null = null;

export function getCachedSnapshot(): GraphSnapshot | null {
  return cachedSnapshot;
}

export async function fetchGraph(): Promise<GraphSnapshot> {
  try {
    const res = await timedFetch("/graph");
    usingMock = false;
    cachedSnapshot = await res.json();
    explanationCache.clear(); // new snapshot, possibly new data — cases must be re-explained
    return cachedSnapshot!;
  } catch {
    // The mock scenario is generated once and reused: it's an in-memory
    // "world" that decisions mutate, not a fresh random draw per fetch.
    if (!usingMock || !cachedSnapshot) {
      usingMock = true;
      cachedSnapshot = buildMockSnapshot();
    }
    return cachedSnapshot;
  }
}

// Explanations are memoised per ring for the life of a snapshot, so the
// panel can be opened, closed and reopened without paying for Claude again,
// and prefetchExplanations() can warm every case right after a load.
const explanationCache = new Map<string, Promise<RingExplanation>>();

// Shown on the live backend when the explanation call fails. Deliberately
// NOT the bundled mock text: that describes a scripted scenario, and for any
// ring it doesn't know it reads "probably a real player" — the opposite of
// the evidence on screen. The measured signals are computed locally and
// stay in the panel regardless.
function unavailableExplanation(ringId: string): RingExplanation {
  return {
    ringId,
    summary:
      "Model izahı bu dəfə hazırlanmadı — backend vaxtında cavab vermədi. Yuxarıdakı ölçülmüş " +
      "sübutlar yerli hesablanıb; case onlarsız da dayanır.",
    signals: [],
    recommendedAction: "Sübutlara əsasən qərar verin. İzah üçün case-i bir az sonra yenidən açın.",
  };
}

export function fetchExplanation(ringId: string): Promise<RingExplanation> {
  if (usingMock) {
    return Promise.resolve(buildMockExplanation(ringId, cachedSnapshot ?? buildMockSnapshot()));
  }
  let pending = explanationCache.get(ringId);
  if (!pending) {
    pending = timedFetch(`/rings/${ringId}/explanation`, undefined, EXPLAIN_TIMEOUT_MS)
      .then((res) => res.json() as Promise<RingExplanation>)
      .catch(() => {
        explanationCache.delete(ringId); // let the next open retry
        return unavailableExplanation(ringId);
      });
    explanationCache.set(ringId, pending);
  }
  return pending;
}

// Fire-and-forget warm-up so that by the time the analyst clicks a case its
// Claude-written summary is already there instead of 10-15s away.
export function prefetchExplanations(ringIds: string[]): void {
  if (usingMock) return;
  for (const id of ringIds) void fetchExplanation(id);
}

// The one call that must NOT fall back to mock data: this is the pitch's
// "throw your own file at it" moment, so a failure has to surface to the
// judge, not disappear into a silent mock swap. Caller re-runs fetchGraph()
// on success to pull the now-real snapshot in.
export async function uploadEvents(events: RawEvent[]): Promise<{ inserted: number; skipped: number }> {
  const res = await timedFetch(
    "/events",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events),
    },
    UPLOAD_TIMEOUT_MS,
  );
  const data: { received: number; inserted: number; skipped: number } = await res.json();
  return { inserted: data.inserted, skipped: data.skipped };
}

export async function submitDecision(ringId: string, decision: Decision): Promise<void> {
  if (!usingMock) {
    try {
      await timedFetch(`/rings/${ringId}/decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      });
      return;
    } catch {
      // fall through — still reflect the decision locally so the demo works
    }
  }
  if (cachedSnapshot) {
    const ring = cachedSnapshot.rings.find((r) => r.id === ringId);
    if (ring) ring.status = decision === "real" ? "confirmed_real" : "confirmed_fraud";
  }
}
