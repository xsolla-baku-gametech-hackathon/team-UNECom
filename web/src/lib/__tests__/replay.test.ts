import { describe, expect, it } from "vitest";
import { deriveGraph } from "../deriveGraph";
import { buildTimeline, replayDurationMs, replayFrame } from "../replay";
import { snapshot } from "./fixture";

describe("replay", () => {
  const snap = snapshot();
  const derived = deriveGraph(snap, 0.5);
  const timeline = buildTimeline(snap);

  it("orders events by time and keeps running totals", () => {
    expect(timeline.order.map((e) => e.id)).toEqual(["e1", "e2", "e3", "e4", "e5", "e6"]);
    expect(timeline.cumFlaggedPurchases).toEqual([0, 1, 1, 1, 1, 1, 1]);
    expect(timeline.cumTransfers).toEqual([0, 0, 0, 1, 2, 3, 4]);
    expect(timeline.cumValueUsd.at(-1)).toBe(327);
    expect(timeline.firstSeen.get("h1")).toBe(2);
    expect(timeline.firstSeen.has("STORE")).toBe(false);
  });

  it("shows nothing before the first event and withholds verdicts until the end", () => {
    expect(replayFrame(derived, timeline, 0).nodes).toHaveLength(0);
    const mid = replayFrame(derived, timeline, 3);
    expect(mid.nodes.map((n) => n.id).sort()).toEqual(["a1", "a2", "h1"]);
    expect(mid.links).toHaveLength(1);
    expect(mid.nodes.every((n) => !n.flagged && !n.isHub)).toBe(true);
    expect(mid.pulseIds.has("a1")).toBe(true); // flagged purchase within the pulse window
    const end = replayFrame(derived, timeline, 99);
    expect(end.index).toBe(6);
    expect(end.nodes).toHaveLength(6);
    expect(end.links).toHaveLength(4);
  });

  it("scales the duration gently with log size and stays within stage bounds", () => {
    expect(replayDurationMs(10)).toBe(12000);
    expect(replayDurationMs(288)).toBe(15200);
    expect(replayDurationMs(100000)).toBe(22000);
  });
});
