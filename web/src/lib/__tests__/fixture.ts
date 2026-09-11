// A four-account world small enough to reason about by hand:
//   a1, a2  fresh mules that bought from STORE (a1 on a flagged card)
//   h1      the hub they both forward to, which then sells to c1
//   c1      an ordinary player; x1, x2 a low-risk second community
import type { AccountEvent, GraphSnapshot, Ring } from "../types";

const ev = (id: string, type: AccountEvent["type"], ts: string, from: string, to: string, value: number, flagged = false): AccountEvent => ({
  id,
  type,
  timestamp: ts,
  from,
  to,
  assetType: "currency",
  assetId: "gold_coins",
  quantity: 1,
  valueUsdEstimate: value,
  paymentFlagged: flagged,
});

export const ring1: Ring = {
  id: "ring_1",
  memberAccountIds: ["a1", "a2", "h1"],
  hubAccountIds: ["h1"],
  riskScore: 0.6,
  status: "pending",
  signals: ["3 accounts in the group"],
  totalValueUsd: 135,
};

export const ring2: Ring = {
  id: "ring_2",
  memberAccountIds: ["x1", "x2", "c1"],
  hubAccountIds: [],
  riskScore: 0.3,
  status: "pending",
  signals: [],
  totalValueUsd: 12,
};

export function snapshot(overrides: Partial<GraphSnapshot> = {}): GraphSnapshot {
  const events = [
    ev("e1", "purchase", "2026-09-10T10:00:00Z", "STORE", "a1", 100, true),
    ev("e2", "purchase", "2026-09-10T10:05:00Z", "STORE", "a2", 50, false),
    ev("e3", "trade", "2026-09-10T10:30:00Z", "a1", "h1", 90),
    ev("e4", "gift", "2026-09-10T10:40:00Z", "a2", "h1", 45),
    ev("e5", "marketplace_sale", "2026-09-10T12:00:00Z", "h1", "c1", 30),
    ev("e6", "trade", "2026-09-10T13:00:00Z", "x1", "x2", 12),
  ];
  return {
    generatedAt: "2026-09-10T14:00:00Z",
    accounts: [
      { id: "a1", label: "a1", createdAt: "2026-09-10T09:00:00Z", riskScore: 0.8, ringId: "ring_1" },
      { id: "a2", label: "a2", createdAt: "2026-09-10T09:30:00Z", riskScore: 0.5, ringId: "ring_1" },
      { id: "h1", label: "h1", createdAt: "2026-05-01T00:00:00Z", riskScore: 0.45, ringId: "ring_1" },
      { id: "c1", label: "c1", createdAt: "2026-03-01T00:00:00Z", riskScore: 0.1, ringId: "ring_2" },
      { id: "x1", label: "x1", createdAt: "2026-03-01T00:00:00Z", riskScore: 0.2, ringId: "ring_2" },
      { id: "x2", label: "x2", createdAt: "2026-03-01T00:00:00Z", riskScore: 0.2, ringId: "ring_2" },
    ],
    events,
    rings: [ring1, ring2],
    stats: { activeAccounts: 6, totalEvents: events.length, totalVolumeUsd: 327, ringsAtRisk: 2 },
    ...overrides,
  };
}
