import { eventRepository } from "../repositories/eventRepository.js";
import type { EventInput } from "../types/event.js";

export const eventService = {
  async ingest(events: EventInput[]) {
    const inserted = await eventRepository.insertMany(events);
    return { received: events.length, inserted, skipped: events.length - inserted };
  },
};
