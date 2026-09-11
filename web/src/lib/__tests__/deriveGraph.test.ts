import { describe, expect, it } from "vitest";
import { deriveGraph } from "../deriveGraph";
import { ring1, ring2, snapshot } from "./fixture";

describe("deriveGraph", () => {
  it("flags a ring when its risk clears the slider's threshold", () => {
    const at05 = deriveGraph(snapshot(), 0.5); // threshold 0.56: ring_1 (0.6) yes, ring_2 (0.3) no
    expect([...at05.flaggedRingIds]).toEqual(["ring_1"]);
    const at09 = deriveGraph(snapshot(), 0.9); // threshold 0.272: both
    expect([...at09.flaggedRingIds].sort()).toEqual(["ring_1", "ring_2"]);
  });

  it("lets an analyst's verdict override the threshold in both directions", () => {
    const snap = snapshot({ rings: [{ ...ring1, status: "confirmed_real" }, { ...ring2, status: "confirmed_fraud" }] });
    const d = deriveGraph(snap, 0.5);
    expect([...d.flaggedRingIds]).toEqual(["ring_2"]);
  });

  it("applies a per-ring sensitivity override only to that ring", () => {
    const d = deriveGraph(snapshot(), 0.5, { ring_2: 0.9 });
    expect([...d.flaggedRingIds].sort()).toEqual(["ring_1", "ring_2"]);
  });

  it("marks nodes with their ring, flag and hub role", () => {
    const d = deriveGraph(snapshot(), 0.5);
    const byId = new Map(d.nodes.map((n) => [n.id, n]));
    expect(byId.get("h1")).toMatchObject({ ringId: "ring_1", flagged: true, isHub: true });
    expect(byId.get("a1")).toMatchObject({ ringId: "ring_1", flagged: true, isHub: false });
    expect(byId.get("c1")).toMatchObject({ ringId: "ring_2", flagged: false, isHub: false });
  });

  it("never draws store purchases, and tags links inside a flagged ring", () => {
    const d = deriveGraph(snapshot(), 0.5);
    expect(d.links.some((l) => l.source === "STORE")).toBe(false);
    expect(d.links).toHaveLength(4);
    const a1h1 = d.links.find((l) => l.source === "a1" && l.target === "h1")!;
    expect(a1h1).toMatchObject({ ringId: "ring_1", flagged: true, timestamp: "2026-09-10T10:30:00Z" });
    const h1c1 = d.links.find((l) => l.source === "h1" && l.target === "c1")!;
    expect(h1c1.ringId).toBeNull(); // crosses two rings
    expect(h1c1.flagged).toBe(false);
  });
});
