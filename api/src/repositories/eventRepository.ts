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

// Postgres caps a single statement at 65,535 bind parameters; an Event row
// binds 11, so one createMany/IN list is kept well under that.
const INSERT_CHUNK_SIZE = 2000;

export const eventRepository = {
  // Duplicate event_ids (re-uploaded batches) are skipped rather than
  // erroring, since ingestion is expected to be retried/replayed: pre-filter
  // known IDs and bulk-insert the rest. Duplicates *within* one upload are
  // collapsed to the first occurrence, so `inserted + skipped` always equals
  // what the client sent. Large uploads are written in chunks.
  async insertMany(events: EventInput[]) {
    const seen = new Set<string>();
    const unique = events.filter((e) => (seen.has(e.event_id) ? false : (seen.add(e.event_id), true)));

    let inserted = 0;
    for (let i = 0; i < unique.length; i += INSERT_CHUNK_SIZE) {
      const chunk = unique.slice(i, i + INSERT_CHUNK_SIZE);
      const existing = await prisma.event.findMany({
        where: { eventId: { in: chunk.map((e) => e.event_id) } },
        select: { eventId: true },
      });
      const existingIds = new Set(existing.map((e) => e.eventId));
      const newEvents = chunk.filter((e) => !existingIds.has(e.event_id));
      if (newEvents.length === 0) continue;
      const result = await prisma.event.createMany({ data: newEvents.map(toRow) });
      inserted += result.count;
    }
    return inserted;
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

  async deleteAll(): Promise<number> {
    const { count } = await prisma.event.deleteMany();
    return count;
  },
};
