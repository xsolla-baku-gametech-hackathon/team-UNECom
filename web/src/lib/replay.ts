// Replay: the loaded log played back in timestamp order, so a viewer sees
// the ring *form* — fresh accounts appear, flagged purchases pulse, value
// drifts toward a hub — instead of being handed the finished picture.
// Nothing here decides anything; it only slices the derived graph by time.
import type { DerivedGraph } from "./deriveGraph";
import type { AccountEvent, GraphLink, GraphNode, GraphSnapshot } from "./types";

export interface ReplayTimeline {
  /** Events in timestamp order. */
  order: AccountEvent[];
  /** Account id -> index in `order` of its first appearance. */
  firstSeen: Map<string, number>;
  /** Prefix sums so a frame's counters are O(1). */
  cumValueUsd: number[];
  cumTransfers: number[];
  cumFlaggedPurchases: number[];
}

export interface ReplayFrame {
  nodes: GraphNode[];
  links: GraphLink[];
  /** Accounts that just made a flagged purchase — drawn with a red pulse. */
  pulseIds: Set<string>;
  index: number;
  total: number;
  /** Timestamp of the latest event shown, ISO string or null before the first. */
  clock: string | null;
  accounts: number;
  transfers: number;
  flaggedPurchases: number;
  valueUsd: number;
}

const PULSE_WINDOW = 6;

export function buildTimeline(snapshot: GraphSnapshot): ReplayTimeline {
  const order = [...snapshot.events].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
  const firstSeen = new Map<string, number>();
  const cumValueUsd: number[] = [0];
  const cumTransfers: number[] = [0];
  const cumFlaggedPurchases: number[] = [0];
  order.forEach((e, i) => {
    if (e.from !== "STORE" && !firstSeen.has(e.from)) firstSeen.set(e.from, i);
    if (!firstSeen.has(e.to)) firstSeen.set(e.to, i);
    cumValueUsd.push(cumValueUsd[i] + e.valueUsdEstimate);
    cumTransfers.push(cumTransfers[i] + (e.from === "STORE" ? 0 : 1));
    cumFlaggedPurchases.push(cumFlaggedPurchases[i] + (e.type === "purchase" && e.paymentFlagged ? 1 : 0));
  });
  return { order, firstSeen, cumValueUsd, cumTransfers, cumFlaggedPurchases };
}

/** The graph as it stood after the first `index` events. */
export function replayFrame(derived: DerivedGraph, timeline: ReplayTimeline, index: number): ReplayFrame {
  const total = timeline.order.length;
  const i = Math.max(0, Math.min(total, index));
  const clock = i > 0 ? timeline.order[i - 1].timestamp : null;

  // Verdicts and hubs stay hidden until the log has fully played: the point
  // is to watch the structure appear before the tool names it.
  const nodes: GraphNode[] = [];
  for (const n of derived.nodes) {
    const seen = timeline.firstSeen.get(n.id);
    if (seen != null && seen < i) nodes.push({ ...n, flagged: false, isHub: false });
  }
  const links = clock ? derived.links.filter((l) => l.timestamp <= clock).map((l) => ({ ...l, flagged: false })) : [];

  const pulseIds = new Set<string>();
  for (let k = Math.max(0, i - PULSE_WINDOW); k < i; k++) {
    const e = timeline.order[k];
    if (e.type === "purchase" && e.paymentFlagged) pulseIds.add(e.to);
  }

  return {
    nodes,
    links,
    pulseIds,
    index: i,
    total,
    clock,
    accounts: nodes.length,
    transfers: timeline.cumTransfers[i],
    flaggedPurchases: timeline.cumFlaggedPurchases[i],
    valueUsd: timeline.cumValueUsd[i],
  };
}

/** How long the playback runs, scaled gently with log size. */
export function replayDurationMs(total: number): number {
  return Math.round(Math.min(22000, Math.max(12000, 8000 + total * 25)));
}
