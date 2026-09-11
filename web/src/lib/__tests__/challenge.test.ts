import { describe, expect, it } from "vitest";
import { generateChallenge, scoreChallenge, type ChallengeParams } from "../challenge";
import type { GraphSnapshot, Ring } from "../types";

const params: ChallengeParams = { seed: 4821, players: 20, mules: 10, hubs: 2, care: 0.5 };

describe("generateChallenge", () => {
  it("is deterministic for a seed, so a judge can hand the number to someone else", () => {
    const a = generateChallenge(params);
    const b = generateChallenge(params);
    expect(a.events).toEqual(b.events);
    expect([...a.truth.ringIds].sort()).toEqual([...b.truth.ringIds].sort());
    expect(generateChallenge({ ...params, seed: 1 }).events).not.toEqual(a.events);
  });

  it("names every account p_#### and leaks no role into the log", () => {
    const { events, truth } = generateChallenge(params);
    const ids = new Set<string>();
    for (const e of events) {
      if (e.from_account_id !== "STORE") ids.add(e.from_account_id);
      ids.add(e.to_account_id);
    }
    expect(ids.size).toBe(params.players + params.mules + params.hubs);
    for (const id of ids) expect(id).toMatch(/^p_\d{4}$/);
    expect(JSON.stringify(events)).not.toMatch(/mule|hub/);
    expect(truth.hubIds.size).toBe(2);
    expect(truth.muleIds.size).toBe(10);
    expect(truth.cleanIds.size).toBe(20);
  });

  it("plays the ring the way the Python generator does: buy, then forward to a hub", () => {
    const { events, truth } = generateChallenge(params);
    for (const mule of truth.muleIds) {
      const buy = events.find((e) => e.type === "purchase" && e.to_account_id === mule)!;
      expect(buy.from_account_id).toBe("STORE");
      // A mule may also relay a peer's value (layering) before its own buy;
      // what must hold is that its own purchase is forwarded afterwards.
      const out = events.filter((e) => e.from_account_id === mule && e.timestamp > buy.timestamp);
      expect(out.length).toBeGreaterThanOrEqual(1);
    }
    for (const hub of truth.hubIds) {
      expect(events.some((e) => e.type === "purchase" && e.to_account_id === hub)).toBe(false); // a hub never touches a card
    }
    const sorted = [...events].sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
    expect(events.map((e) => e.event_id)).toEqual(sorted.map((e) => e.event_id));
  });
});

describe("scoreChallenge", () => {
  const { events, truth } = generateChallenge(params);
  const snap: GraphSnapshot = {
    generatedAt: "",
    accounts: [],
    events: events.map((e) => ({ id: e.event_id, type: e.type, timestamp: e.timestamp, from: e.from_account_id, to: e.to_account_id, assetType: e.asset_type, assetId: e.asset_id, quantity: e.quantity, valueUsdEstimate: e.value_usd_estimate, paymentFlagged: e.payment_flagged })),
    rings: [],
    stats: { activeAccounts: 0, totalEvents: 0, totalVolumeUsd: 0, ringsAtRisk: 0 },
  };
  const ring = (members: string[]): Ring => ({ id: "r", memberAccountIds: members, hubAccountIds: [], riskScore: 1, status: "pending", signals: [], totalValueUsd: 0 });

  it("is 100% when the flagged ring is exactly the planted one", () => {
    const s = scoreChallenge(truth, snap, [ring([...truth.ringIds])]);
    expect(s.ringCaught).toBe(s.ringTotal);
    expect(s.hubCaught).toBe(2);
    expect(s.falsePositives).toBe(0);
    expect(s.valueCaughtUsd).toBeCloseTo(s.valueTotalUsd);
  });

  it("is 0% with nothing flagged, and counts real players wrongly flagged", () => {
    expect(scoreChallenge(truth, snap, []).ringCaught).toBe(0);
    const [clean1, clean2] = [...truth.cleanIds];
    const s = scoreChallenge(truth, snap, [ring([clean1, clean2, [...truth.hubIds][0]])]);
    expect(s.falsePositives).toBe(2);
    expect(s.hubCaught).toBe(1);
  });
});
