// Mirrors web/src/lib/types.ts's GraphSnapshot shape exactly — /web reads
// this straight off GET /graph. Keep field names in sync with that file.

export interface GraphAccount {
  id: string;
  label: string;
  createdAt: string | null;
  riskScore: number;
  ringId: string | null;
}

export interface GraphAccountEvent {
  id: string;
  type: string;
  timestamp: string;
  from: string;
  to: string;
  assetType: string;
  assetId: string;
  quantity: number;
  valueUsdEstimate: number;
  paymentFlagged: boolean;
}

export type RingStatus = "pending" | "confirmed_fraud" | "confirmed_real";

export interface GraphRing {
  id: string;
  memberAccountIds: string[];
  hubAccountIds: string[];
  riskScore: number;
  status: RingStatus;
  signals: string[];
  totalValueUsd: number;
}

export interface GraphSnapshot {
  generatedAt: string;
  accounts: GraphAccount[];
  events: GraphAccountEvent[];
  rings: GraphRing[];
  stats: {
    activeAccounts: number;
    totalEvents: number;
    totalVolumeUsd: number;
    ringsAtRisk: number;
  };
}
