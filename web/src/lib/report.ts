import { caseRef } from "./format";
import type { GraphSnapshot, Ring } from "./types";

// What the analyst walks away with once the queue is empty: a tally of the
// verdicts, the accounts that now go to the payments team, and a report file.
// Without this the last "Next case" click simply did nothing.
export function buildReport(snapshot: GraphSnapshot, flaggedRings: Ring[], sensitivity: number) {
  const fraud = flaggedRings.filter((r) => r.status === "confirmed_fraud");
  const real = flaggedRings.filter((r) => r.status === "confirmed_real");
  const pending = flaggedRings.filter((r) => r.status === "pending");
  const fraudAccounts = [...new Set(fraud.flatMap((r) => r.memberAccountIds))];
  const fraudHubs = [...new Set(fraud.flatMap((r) => r.hubAccountIds))];
  const fraudValueUsd = fraud.reduce((s, r) => s + r.totalValueUsd, 0);
  const clearedAccounts = [...new Set(real.flatMap((r) => r.memberAccountIds))];
  return {
    generatedAt: new Date().toISOString(),
    snapshotGeneratedAt: snapshot.generatedAt,
    sensitivity,
    events: snapshot.events.length,
    accounts: snapshot.accounts.length,
    ringsFlagged: flaggedRings.length,
    ringsBelowThreshold: snapshot.rings.length - flaggedRings.length,
    verdicts: { fraud: fraud.length, real: real.length, pending: pending.length },
    fraudValueUsd: Math.round(fraudValueUsd * 100) / 100,
    fraudAccounts,
    fraudHubs,
    clearedAccounts,
    rings: flaggedRings.map((r) => ({
      id: r.id,
      caseRef: caseRef(r.id),
      status: r.status,
      riskScore: r.riskScore,
      totalValueUsd: r.totalValueUsd,
      hubAccountIds: r.hubAccountIds,
      memberAccountIds: r.memberAccountIds,
    })),
  };
}
