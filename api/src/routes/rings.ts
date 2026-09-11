import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ringService } from "../services/ringService.js";
import { explanationService } from "../services/explanationService.js";
import { EngineError } from "../clients/engineClient.js";

const sensitivityBodySchema = z.object({
  sensitivity: z.number().min(0).max(1),
});

const decisionBodySchema = z.object({
  decision: z.enum(["real", "fraud"]),
});

export async function ringRoutes(app: FastifyInstance) {
  // GET /rings — flagged fraud rings from the engine, with the designer's
  // saved sensitivity override merged in.
  app.get("/rings", async (_request, reply) => {
    try {
      return await ringService.listRings();
    } catch (err) {
      if (err instanceof EngineError) {
        return reply.status(err.statusCode).send({ error: err.statusCode === 504 ? "engine_timeout" : err.statusCode === 502 ? "engine_unreachable" : "engine_request_failed", message: err.message });
      }
      throw err;
    }
  });

  // GET /rings/:id/explanation — /web's InvestigationPanel "Model interpretation"
  // section, proxied to the engine's Claude-generated explanation.
  app.get<{ Params: { id: string } }>("/rings/:id/explanation", async (request, reply) => {
    try {
      return await explanationService.getExplanation(request.params.id);
    } catch (err) {
      if (err instanceof EngineError) {
        return reply.status(err.statusCode).send({ error: err.statusCode === 504 ? "engine_timeout" : err.statusCode === 502 ? "engine_unreachable" : "engine_request_failed", message: err.message });
      }
      throw err;
    }
  });

  // POST /rings/:id/sensitivity — persists the designer's sensitivity
  // adjustment for a ring, independent of engine uptime.
  app.post<{ Params: { id: string }; Body: unknown }>("/rings/:id/sensitivity", async (request, reply) => {
    const parsed = sensitivityBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_body", details: parsed.error.flatten() });
    }

    const updated = await ringService.setSensitivity(request.params.id, parsed.data.sensitivity);
    return reply.status(200).send({
      ring_id: updated.ringId,
      sensitivity: updated.sensitivity,
      updated_at: updated.updatedAt,
    });
  });

  // POST /rings/:id/decision — /web's InvestigationPanel "real player" /
  // "fraud" verdict buttons. Persists independent of engine uptime; GET
  // /graph reports it back as the ring's status.
  app.post<{ Params: { id: string }; Body: unknown }>("/rings/:id/decision", async (request, reply) => {
    const parsed = decisionBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: "invalid_body", details: parsed.error.flatten() });
    }

    const updated = await ringService.setDecision(request.params.id, parsed.data.decision);
    return reply.status(200).send({
      ring_id: updated.ringId,
      status: updated.status,
      decided_at: updated.decidedAt,
    });
  });
}
