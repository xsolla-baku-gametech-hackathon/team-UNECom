// Shared with api/prisma/schema.prisma (Event, RingSensitivity) and the
// /engine risk-scoring service. Keep in sync — see /docs/api-contract.md.

export type EventType = "trade" | "gift" | "marketplace_sale" | "key_redeem" | "purchase";

export interface AccountEvent {
  id: string;
  type: EventType;
  timestamp: string;
  from: string;
  to: string;
  assetType: "currency" | "item" | "key";
  assetId: string;
  quantity: number;
  valueUsdEstimate: number;
  paymentFlagged: boolean;
}

export type RingStatus = "pending" | "confirmed_fraud" | "confirmed_real";

export interface Account {
  id: string;
  label: string;
  createdAt: string | null;
  riskScore: number; // 0..1, provided by /engine at sensitivity=0.5 baseline
  ringId: string | null;
}

export interface Ring {
  id: string;
  memberAccountIds: string[];
  hubAccountIds: string[];
  riskScore: number; // 0..1 baseline severity, independent of the UI threshold
  status: RingStatus;
  signals: string[];
  totalValueUsd: number;
}

export interface GraphSnapshot {
  generatedAt: string;
  accounts: Account[];
  events: AccountEvent[];
  rings: Ring[];
  stats: {
    activeAccounts: number;
    totalEvents: number;
    totalVolumeUsd: number;
    ringsAtRisk: number;
  };
}

export interface RingExplanation {
  source: "ai" | "template" | "demo" | "unavailable";
  ringId: string;
  summary: string;
  signals: { label: string; value: string }[];
  recommendedAction: string;
}

export interface GraphNode {
  id: string;
  label: string;
  riskScore: number;
  ringId: string | null;
  flagged: boolean;
  isHub: boolean;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: EventType;
  valueUsdEstimate: number;
  paymentFlagged: boolean;
}
