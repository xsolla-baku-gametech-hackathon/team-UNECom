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

export async function fetchExplanation(ringId: string): Promise<RingExplanation> {
  if (!usingMock) {
    try {
      const res = await timedFetch(`/rings/${ringId}/explanation`);
      return await res.json();
    } catch {
      // fall through to mock
    }
  }
  const snapshot = cachedSnapshot ?? buildMockSnapshot();
  return buildMockExplanation(ringId, snapshot);
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
    } catch {
      // fall through — still reflect the decision locally so the demo works
    }
  }
  // Reflect the verdict in the cached snapshot in every mode. On the live
  // backend the decision is persisted and GET /graph would report it on the
  // next load, but the panel, queue badge and header counter read from this
  // cache right now — without this the UI stayed "pending" until a reload.
  if (cachedSnapshot) {
    const ring = cachedSnapshot.rings.find((r) => r.id === ringId);
    if (ring) ring.status = decision === "real" ? "confirmed_real" : "confirmed_fraud";
  }
}
