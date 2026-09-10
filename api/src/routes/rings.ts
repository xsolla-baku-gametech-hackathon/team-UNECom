import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { ringService } from "../services/ringService.js";
import { EngineError } from "../clients/engineClient.js";

const sensitivityBodySchema = z.object({
  sensitivity: z.number().min(0).max(1),
});

export async function ringRoutes(app: FastifyInstance) {
  // GET /rings — flagged fraud rings from the engine, with the designer's
  // saved sensitivity override merged in.
  app.get("/rings", async (_request, reply) => {
    try {
      return await ringService.listRings();
    } catch (err) {
      if (err instanceof EngineError) {
        return reply.status(502).send({ error: "engine_unreachable", message: err.message });
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
}
