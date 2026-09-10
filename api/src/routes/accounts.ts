import type { FastifyInstance } from "fastify";
import { riskService } from "../services/riskService.js";
import { EngineError } from "../clients/engineClient.js";

export async function accountRoutes(app: FastifyInstance) {
  // GET /accounts/:id/risk — proxies to the /engine analyzer and returns
  // this account's risk breakdown.
  app.get<{ Params: { id: string } }>("/accounts/:id/risk", async (request, reply) => {
    try {
      const account = await riskService.getAccountRisk(request.params.id);
      if (!account) {
        return reply.status(404).send({ error: "account_not_found" });
      }
      return account;
    } catch (err) {
      if (err instanceof EngineError) {
        return reply.status(err.statusCode).send({ error: err.statusCode === 504 ? "engine_timeout" : err.statusCode === 502 ? "engine_unreachable" : "engine_request_failed", message: err.message });
      }
      throw err;
    }
  });
}
