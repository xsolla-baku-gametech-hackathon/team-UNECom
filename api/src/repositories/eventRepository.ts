import { prisma } from "../db/prisma.js";
import type { EventInput } from "../types/event.js";
import type { EngineEvent } from "../clients/engineClient.js";

function toRow(event: EventInput) {
  return {
    eventId: event.event_id,
    type: event.type,
    timestamp: event.timestamp,
    fromAccountId: event.from_account_id,
    toAccountId: event.to_account_id,
    assetType: event.asset_type,
    assetId: event.asset_id,
    quantity: event.quantity,
    valueUsdEstimate: event.value_usd_estimate,
    paymentFlagged: event.payment_flagged,
    accountCreatedAt: event.account_created_at,
  };
}

export const eventRepository = {
  // Duplicate event_ids (re-uploaded batches) are skipped rather than
  // erroring, since ingestion is expected to be retried/replayed. SQLite's
  // createMany has no skipDuplicates support, so pre-filter known IDs and
  // bulk-insert the rest in one statement (fast even for thousand-row batches).
  async insertMany(events: EventInput[]) {
    const ids = events.map((e) => e.event_id);
    const existing = await prisma.event.findMany({
      where: { eventId: { in: ids } },
      select: { eventId: true },
    });
    const existingIds = new Set(existing.map((e) => e.eventId));
    const newEvents = events.filter((e) => !existingIds.has(e.event_id));

    if (newEvents.length === 0) return 0;

    const result = await prisma.event.createMany({ data: newEvents.map(toRow) });
    return result.count;
  },

  // All stored events, reshaped back into the shared contract, for handing
  // to the /engine analyzer.
  async findAllAsContract(): Promise<EngineEvent[]> {
    const rows = await prisma.event.findMany({ orderBy: { timestamp: "asc" } });
    return rows.map((r) => ({
      event_id: r.eventId,
      type: r.type,
      timestamp: r.timestamp.toISOString(),
      from_account_id: r.fromAccountId,
      to_account_id: r.toAccountId,
      asset_type: r.assetType,
      asset_id: r.assetId,
      quantity: r.quantity,
      value_usd_estimate: r.valueUsdEstimate,
      payment_flagged: r.paymentFlagged,
      account_created_at: r.accountCreatedAt ? r.accountCreatedAt.toISOString() : null,
    }));
  },
};
