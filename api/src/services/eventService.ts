import { prisma } from "../db/prisma.js";
import { eventRepository } from "../repositories/eventRepository.js";
import { ringDecisionRepository } from "../repositories/ringDecisionRepository.js";
import { ringSensitivityRepository } from "../repositories/ringSensitivityRepository.js";
import type { EventInput } from "../types/event.js";

export const eventService = {
  async ingest(events: EventInput[]) {
    const inserted = await eventRepository.insertMany(events);
    return { received: events.length, inserted, skipped: events.length - inserted };
  },

  // Decisions and sensitivity overrides are keyed by ring id, and ring ids are
  // assigned by community detection over whatever events are loaded. Dropping
  // the events without dropping those rows would leave a verdict from the old
  // dataset attached to an unrelated cluster in the next one.
  // One transaction, so a failure part-way cannot leave the events gone
  // but a verdict still attached to a ring id that no longer exists.
  async resetAll() {
    const [events, decisions, sensitivities] = await prisma.$transaction(async (tx) => [
      await eventRepository.deleteAll(tx),
      await ringDecisionRepository.deleteAll(tx),
      await ringSensitivityRepository.deleteAll(tx),
    ]);
    return { deleted: { events, decisions, sensitivities } };
  },
};
