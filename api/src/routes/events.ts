import type { FastifyInstance } from "fastify";
import { eventsBodySchema } from "../types/event.js";
import { eventService } from "../services/eventService.js";
import { config } from "../config.js";

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

  // POST /events/reset — empties the demo database so the dashboard is back to
  // its "no data ingested" state. Exists so the pitch can be reset from the UI
  // instead of a terminal; guarded by ALLOW_DEMO_RESET because the database is
  // shared and a deployed build must not offer this to visitors.
  app.post("/events/reset", async (_request, reply) => {
    if (!config.allowDemoReset) {
      return reply.status(403).send({ error: "reset_disabled" });
    }

    const result = await eventService.resetAll();
    return reply.status(200).send(result);
  });
}
