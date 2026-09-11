import type { FastifyInstance } from "fastify";
import { graphService } from "../services/graphService.js";
import { sendEngineError } from "./engineErrors.js";

export async function graphRoutes(app: FastifyInstance) {
  // GET /graph — full dashboard snapshot for /web (accounts, events, rings,
  // stats). See web/src/lib/types.ts's GraphSnapshot, which this mirrors.
  app.get("/graph", async (_request, reply) => {
    try {
      return await graphService.buildSnapshot();
    } catch (err) {
      return sendEngineError(reply, err);
    }
  });
}
