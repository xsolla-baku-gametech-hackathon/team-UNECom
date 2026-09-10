// The core differentiator, computed rather than claimed.
//
// A payment-moment tool (Sift, Kount, Magify) only ever sees an account when
// that account is on the receiving end of a transaction its payment processor
// flagged. In the value graph that is exactly the set of `to` sides of
// `paymentFlagged` events — mule accounts that bought from STORE with a bad
// card. Cash-out hubs never touch a flagged card themselves; they only ever
// *receive transfers* from the mules, so a payment-moment tool is blind to
// them even though that is where the value ends up.
//
// Everything here is derived from the loaded snapshot — nothing is hardcoded,
// so a judge's own uploaded file produces its own honest numbers.
import type { GraphSnapshot, Ring } from "./types";

export interface PaymentMomentView {
  /** Accounts a payment-moment tool could see at all. */
  visibleIds: Set<string>;
  visibleCount: number;
  /** Members of currently flagged rings that such a tool never sees. */
  missedIds: Set<string>;
  missedCount: number;
  /** Value flowing *into* those missed accounts, in USD. */
  missedValueUsd: number;
  /** Cash-out hubs among the missed accounts — the punchline of the demo. */
  missedHubIds: string[];
  missedHubCount: number;
  /** Total hubs in the flagged rings, for "K of T" framing. */
  hubCount: number;
}

export function computePaymentMomentView(
  snapshot: GraphSnapshot,
  flaggedRings: Ring[],
): PaymentMomentView {
  const accountIds = new Set(snapshot.accounts.map((a) => a.id));

  const visibleIds = new Set<string>();
  for (const e of snapshot.events) {
    if (e.paymentFlagged && accountIds.has(e.to)) visibleIds.add(e.to);
  }

  const members = new Set<string>();
  const hubs = new Set<string>();
  for (const ring of flaggedRings) {
    for (const id of ring.memberAccountIds) if (accountIds.has(id)) members.add(id);
    for (const id of ring.hubAccountIds) if (accountIds.has(id)) hubs.add(id);
  }

  const missedIds = new Set<string>();
  for (const id of members) if (!visibleIds.has(id)) missedIds.add(id);

  let missedValueUsd = 0;
  for (const e of snapshot.events) {
    if (missedIds.has(e.to)) missedValueUsd += e.valueUsdEstimate;
  }

  const missedHubIds = [...hubs].filter((id) => !visibleIds.has(id));

  return {
    visibleIds,
    visibleCount: visibleIds.size,
    missedIds,
    missedCount: missedIds.size,
    missedValueUsd,
    missedHubIds,
    missedHubCount: missedHubIds.length,
    hubCount: hubs.size,
  };
}
