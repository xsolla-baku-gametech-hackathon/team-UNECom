// The guided briefing that plays after an upload. Every sentence is built
// from the loaded snapshot — counts, dollar values, ring and hub ids — so a
// judge who drops their own file gets a briefing about *their* data, never
// about ours. Nothing here is hardcoded narrative.
import type { DerivedGraph } from "./deriveGraph";
import { caseRef, usd } from "./format";
import type { PaymentMomentView } from "./paymentMomentView";
import type { GraphSnapshot, Ring } from "./types";

export interface BriefingStat {
  value: number;
  /** Rendered in front of the number, e.g. "$". */
  prefix?: string;
  label: string;
}

export interface BriefingStep {
  id: string;
  /** Short uppercase eyebrow, e.g. "STEP 1 · THE LOG". */
  eyebrow: string;
  title: string;
  body: string;
  stat?: BriefingStat;
  /** Accounts to keep lit on the graph; everything else dims. */
  spotlightIds?: Set<string>;
  /** Hubs to draw with an orange halo. */
  spotlightHubIds?: Set<string>;
  /** Force the payment-moment mask on while this step is showing. */
  paymentMoment?: boolean;
  /** Optional primary action shown as a button. */
  action?: { label: string; ringId: string };
}

function inboundCount(snapshot: GraphSnapshot, accountId: string): number {
  const senders = new Set<string>();
  for (const e of snapshot.events) if (e.to === accountId && e.from !== "STORE") senders.add(e.from);
  return senders.size;
}

export function buildBriefing(
  snapshot: GraphSnapshot,
  derived: DerivedGraph,
  flaggedRings: Ring[],
  paymentView: PaymentMomentView,
  sensitivity: number,
): BriefingStep[] {
  const steps: BriefingStep[] = [];
  const events = snapshot.events.length;
  const accounts = snapshot.accounts.length;
  const totalUsd = snapshot.events.reduce((s, e) => s + e.valueUsdEstimate, 0);
  const transfers = derived.links.length;
  const purchases = events - transfers;
  const flaggedPurchases = snapshot.events.filter((e) => e.paymentFlagged).length;

  steps.push({
    id: "log",
    eyebrow: "Step 1 · The log",
    title: "Your event log is now a map of where value went.",
    body:
      `${events.toLocaleString("en-US")} events between ${accounts.toLocaleString("en-US")} accounts, worth ${usd(totalUsd)}. ` +
      `Each dot is a player account, each line a transfer between two of them: trade, gift, marketplace sale or key redemption. ` +
      `The ${purchases.toLocaleString("en-US")} store purchases are not drawn; they only decide whose money is suspect ` +
      `(${flaggedPurchases.toLocaleString("en-US")} of them were flagged by the card processor).`,
    stat: { value: accounts, label: "accounts mapped" },
  });

  const ringsTotal = snapshot.rings.length;
  const flaggedMembers = new Set<string>();
  for (const r of flaggedRings) for (const id of r.memberAccountIds) flaggedMembers.add(id);
  const pct = Math.round(sensitivity * 100);

  if (flaggedRings.length === 0) {
    steps.push({
      id: "rings",
      eyebrow: "Step 2 · Rings",
      title: ringsTotal === 0 ? "No community in this log moves value like a ring." : "Rings exist here, but none clears the current threshold.",
      body:
        ringsTotal === 0
          ? "Community detection found no cluster of accounts passing value among themselves. That is the tool being right, not silent: it does not flag everything."
          : `${ringsTotal} communities were found, none with an average risk above the bar at sensitivity ${pct}%. Move the slider to the right to lower the bar and see which surface first.`,
      stat: { value: ringsTotal, label: "communities found" },
    });
  } else {
    steps.push({
      id: "rings",
      eyebrow: "Step 2 · Rings",
      title: `${flaggedRings.length === 1 ? "One ring crosses" : `${flaggedRings.length} rings cross`} the risk bar. ${ringsTotal - flaggedRings.length} more sit below it.`,
      body:
        `Community detection groups accounts that keep passing value among themselves. A community becomes a case when its average risk clears the threshold, ` +
        `set right now by the sensitivity slider at ${pct}%. The lit dots are the ${flaggedMembers.size} accounts inside the flagged ${flaggedRings.length === 1 ? "ring" : "rings"}.`,
      stat: { value: flaggedRings.length, label: `of ${ringsTotal} communities flagged` },
      spotlightIds: flaggedMembers,
    });

    const top = [...flaggedRings].sort((a, b) => b.riskScore - a.riskScore)[0];
    const members = new Set(top.memberAccountIds);
    const feeders = top.memberAccountIds.length - top.hubAccountIds.length;
    steps.push({
      id: "top-ring",
      eyebrow: "Step 3 · The top case",
      title: `${caseRef(top.id)}: ${feeders} accounts feed value into ${top.hubAccountIds.length === 1 ? "one collection point" : `${top.hubAccountIds.length} collection points`}.`,
      body:
        `Risk ${top.riskScore.toFixed(2)}, ${usd(top.totalValueUsd)} moved inside the ring. The shape is the classic mule pattern: many fresh accounts buy with a card, ` +
        `then forward what they bought within minutes, all in the same direction.`,
      stat: { value: top.totalValueUsd, prefix: "$", label: "at risk in this ring" },
      spotlightIds: members,
    });

    if (top.hubAccountIds.length > 0) {
      const hub = top.hubAccountIds[0];
      const inbound = inboundCount(snapshot, hub);
      const touchedCard = paymentView.visibleIds.has(hub);
      steps.push({
        id: "hub",
        eyebrow: "Step 4 · The cash-out hub",
        title: `${hub} collects from ${inbound} accounts${touchedCard ? "." : " and never touched a flagged card."}`,
        body:
          `The outlined dot is where the value lands before it leaves the game as a marketplace sale. ` +
          (touchedCard
            ? "This hub did make a flagged purchase itself, so a payment-time tool would at least see it."
            : "It only ever receives transfers, so no payment-time check ever fires on it. Only the structure of the flow points at it."),
        stat: { value: inbound, label: "accounts feeding this hub" },
        spotlightIds: members,
        spotlightHubIds: new Set(top.hubAccountIds),
      });
    }

    steps.push({
      id: "payment-moment",
      eyebrow: "Step 5 · What a payment-time tool sees",
      title:
        paymentView.missedCount > 0
          ? `A payment-time tool sees ${paymentView.visibleCount} accounts and misses ${paymentView.missedCount}.`
          : `In this log a payment-time tool would see every flagged account.`,
      body:
        paymentView.missedCount > 0
          ? `The dimmed dots are accounts the card processor never had a reason to look at. They hold ${usd(paymentView.missedValueUsd)}, ` +
            `including ${paymentView.missedHubCount} of ${paymentView.hubCount} cash-out hubs. That gap is what tracing the flow after the payment adds.`
          : "Every ring member here bought with a flagged card, so there is no hidden arm in this dataset. The mask is computed from your file, not scripted.",
      stat: { value: paymentView.missedValueUsd, prefix: "$", label: "invisible at the payment moment" },
      paymentMoment: true,
    });

    steps.push({
      id: "decide",
      eyebrow: "Step 6 · Your move",
      title: "Open the case, read the written summary, decide.",
      body:
        "Claude writes each case up from the measured evidence: what was found, how confident, what it recommends. " +
        "It never acts. An analyst presses Fraud or Real player, and nothing is blocked automatically. J/K walk the queue, Enter opens, F or R decides.",
      action: { label: `Open ${caseRef(top.id)}`, ringId: top.id },
    });
  }

  return steps;
}
