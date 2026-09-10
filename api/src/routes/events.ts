import type { FastifyInstance } from "fastify";
import { eventsBodySchema } from "../types/event.js";
import { eventService } from "../services/eventService.js";

export async function eventRoutes(app: FastifyInstance) {
  // POST /events — accepts a single event object or an array (batch upload),
  // e.g. from data-generator/output/events.json.
  app.post("/events", async (request, reply) => {
    const parsed = eventsBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_event_payload", details: parsed.error.flatten() });
    }

    const events = Array.isArray(parsed.data) ? parsed.data : [parsed.data];
    const result = await eventService.ingest(events);
    return reply.status(201).send(result);
  });
}
