import { engineClient, type EngineEvent, type EngineRingResult } from "../clients/engineClient.js";
import { eventRepository } from "../repositories/eventRepository.js";
import { ringDecisionRepository } from "../repositories/ringDecisionRepository.js";
import type { GraphAccount, GraphAccountEvent, GraphRing, GraphSnapshot, RingStatus } from "../types/graph.js";

function toGraphEvent(e: EngineEvent): GraphAccountEvent {
  return {
    id: e.event_id,
    type: e.type,
    timestamp: e.timestamp,
    from: e.from_account_id,
    to: e.to_account_id,
    assetType: e.asset_type,
    assetId: e.asset_id,
    quantity: e.quantity,
    valueUsdEstimate: e.value_usd_estimate,
    paymentFlagged: e.payment_flagged,
  };
}

// account_created_at on an event is always from_account_id's own creation
// date (data-generator/generate.py convention) — take the first we see.
function buildAccountCreatedAtMap(events: EngineEvent[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const e of events) {
    if (e.account_created_at && !map.has(e.from_account_id)) {
      map.set(e.from_account_id, e.account_created_at);
    }
  }
  return map;
}

// Engine risk_score is 0-100 (risk_scoring.py caps at min(risk, 100.0));
// /web's GraphSnapshot expects 0-1 (web/src/lib/types.ts).
function normalizeRiskScore(score: number): number {
  return Math.min(1, Math.max(0, score / 100));
}

function buildAccountRingMap(rings: EngineRingResult[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const ring of rings) {
    for (const accountId of ring.account_ids) {
      if (!map.has(accountId)) map.set(accountId, ring.ring_id);
    }
  }
  return map;
}

// Short, human-readable signal strings for the InvestigationPanel's
// "Siqnallar" list. The engine's RingResult only has numeric fields, so we
// phrase them here rather than push formatting onto /web.
function deriveSignals(ring: EngineRingResult): string[] {
  const signals: string[] = [
    `${ring.size} accounts in the group, average taint score ${Math.round(ring.avg_taint_score * 100)}%`,
  ];
  if (ring.flagged_purchase_count > 0) {
    signals.push(`${ring.flagged_purchase_count} source purchases flagged by the payment provider`);
  }
  if (ring.hub_candidates.length > 0) {
    signals.push(`${ring.hub_candidates.length} ${ring.hub_candidates.length === 1 ? "hub collects" : "hubs collect"} the value and cash it out`);
  }
  signals.push(`Total value at risk: $${ring.total_value_usd.toLocaleString("en-US")}`);
  return signals;
}

export const graphService = {
  async buildSnapshot(): Promise<GraphSnapshot> {
    const contractEvents = await eventRepository.findAllAsContract();

    // An empty database is a real, expected state — it's what /web renders its
    // "no data ingested" screen from, and what a first upload starts from. The
    // engine rejects an empty event list (AnalyzeRequest requires min_length=1),
    // so asking it would surface as engine_unreachable and push /web into its
    // offline mock mode instead of showing the empty state.
    if (contractEvents.length === 0) {
      return {
        generatedAt: new Date().toISOString(),
        accounts: [],
        events: [],
        rings: [],
        stats: { activeAccounts: 0, totalEvents: 0, totalVolumeUsd: 0, ringsAtRisk: 0 },
      };
    }

    const [analysis, decisions] = await Promise.all([
      engineClient.analyze(contractEvents),
      ringDecisionRepository.findAll(),
    ]);

    const accountCreatedAt = buildAccountCreatedAtMap(contractEvents);
    const accountRingId = buildAccountRingMap(analysis.rings);
    const decisionByRingId = new Map(decisions.map((d) => [d.ringId, d.status as RingStatus]));

    const accounts: GraphAccount[] = analysis.accounts.map((a) => ({
      id: a.account_id,
      label: a.account_id,
      createdAt: accountCreatedAt.get(a.account_id) ?? null,
      riskScore: normalizeRiskScore(a.risk_score),
      ringId: accountRingId.get(a.account_id) ?? null,
    }));

    const rings: GraphRing[] = analysis.rings.map((r) => ({
      id: r.ring_id,
      memberAccountIds: r.account_ids,
      hubAccountIds: r.hub_candidates,
      riskScore: normalizeRiskScore(r.risk_score),
      status: decisionByRingId.get(r.ring_id) ?? "pending",
      signals: deriveSignals(r),
      totalValueUsd: r.total_value_usd,
    }));

    const events = contractEvents.map(toGraphEvent);

    return {
      generatedAt: analysis.generated_at,
      accounts,
      events,
      rings,
      stats: {
        activeAccounts: accounts.length,
        totalEvents: events.length,
        totalVolumeUsd: Math.round(events.reduce((sum, e) => sum + e.valueUsdEstimate, 0) * 100) / 100,
        ringsAtRisk: rings.length,
      },
    };
  },
};
