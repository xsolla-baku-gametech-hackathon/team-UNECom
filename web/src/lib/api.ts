// Talks to the /api gateway described in /docs/api-contract.md. Falls back
// to local mock data whenever the backend isn't reachable yet, so the
// dashboard is always demoable regardless of backend build status.
import { buildMockExplanation, buildMockSnapshot } from "./mockData";
import type { RawEvent } from "./parseUpload";
import type { GraphSnapshot, RingExplanation } from "./types";

export type Decision = "real" | "fraud";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const FETCH_TIMEOUT_MS = 35000;
const UPLOAD_TIMEOUT_MS = 60000; // a judge's own export can be large; the API writes it to Postgres in chunks

let usingMock = false;
export function isUsingMockData() {
  return usingMock;
}

async function timedFetch<T>(path: string, init?: RequestInit, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`${res.status} ${res.statusText}${detail ? ` — ${detail}` : ""}`);
    }
    return await res.json() as T;
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
    const data = await timedFetch<GraphSnapshot>("/graph");
    usingMock = false;
    cachedSnapshot = data;
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

const explanations = new Map<string, Promise<RingExplanation>>();

export function fetchExplanation(ringId: string): Promise<RingExplanation> {
  if (usingMock) return Promise.resolve(buildMockExplanation(ringId, cachedSnapshot ?? buildMockSnapshot()));
  const existing = explanations.get(ringId);
  if (existing) return existing;
  const pending = timedFetch<RingExplanation>(`/rings/${encodeURIComponent(ringId)}/explanation`)
    .catch((): RingExplanation => ({
      ringId,
      source: "unavailable",
      summary: "The explanation is late or unavailable. Review the measured evidence.",
      signals: [],
      recommendedAction: "Decide from the ring's measured evidence.",
    }));
  explanations.set(ringId, pending);
  return pending;
}

export function prefetchExplanations(ringIds: string[]): void {
  for (const ringId of ringIds) void fetchExplanation(ringId);
}

// The one call that must NOT fall back to mock data: this is the pitch's
// "throw your own file at it" moment, so a failure has to surface to the
// judge, not disappear into a silent mock swap. Caller re-runs fetchGraph()
// on success to pull the now-real snapshot in.
export async function uploadEvents(events: RawEvent[]): Promise<{ inserted: number; skipped: number }> {
  const data = await timedFetch<{ received: number; inserted: number; skipped: number }>(
    "/events",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(events),
    },
    UPLOAD_TIMEOUT_MS,
  );
  explanations.clear();
  return { inserted: data.inserted, skipped: data.skipped };
}

// Empties the backend demo database, putting the dashboard back to its "no data
// ingested" state. Deliberately never falls back to mock data: a reset that
// quietly did nothing would leave the old dataset on screen and look like it
// worked. Fails loudly instead, including the 403 when the backend has
// ALLOW_DEMO_RESET off.
export async function resetDemoData(): Promise<{ events: number; decisions: number }> {
  const data = await timedFetch<{ deleted: { events: number; decisions: number } }>("/events/reset", { method: "POST" }, UPLOAD_TIMEOUT_MS);
  // Ring ids are reassigned by community detection on the next ingest, so a
  // cached summary would end up describing a different cluster.
  explanations.clear();
  cachedSnapshot = null;
  return { events: data.deleted.events, decisions: data.deleted.decisions };
}

export async function submitDecision(ringId: string, decision: Decision): Promise<void> {
  if (!usingMock) {
    await timedFetch(`/rings/${encodeURIComponent(ringId)}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
  }
  if (cachedSnapshot) {
    const ring = cachedSnapshot.rings.find((r) => r.id === ringId);
    if (ring) ring.status = decision === "real" ? "confirmed_real" : "confirmed_fraud";
  }
}
