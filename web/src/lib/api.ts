// Talks to the /api gateway described in /docs/api-contract.md. Falls back
// to local mock data whenever the backend isn't reachable yet, so the
// dashboard is always demoable regardless of backend build status.
import { buildMockExplanation, buildMockSnapshot } from "./mockData";
import type { GraphSnapshot, RingExplanation } from "./types";

export type Decision = "real" | "fraud";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";
const FETCH_TIMEOUT_MS = 1500;

let usingMock = false;
export function isUsingMockData() {
  return usingMock;
}

async function timedFetch(path: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
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
