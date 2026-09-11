import type { FastifyReply } from "fastify";
import { EngineError } from "../clients/engineClient.js";

export type EngineErrorCode = "engine_timeout" | "engine_unreachable" | "not_found" | "engine_request_failed";

// One place that decides how an engine failure reads on the wire. Every
// route that proxies the engine used to carry its own copy of this mapping.
export function engineErrorCode(err: EngineError): EngineErrorCode {
  switch (err.statusCode) {
    case 504:
      return "engine_timeout";
    case 502:
      return "engine_unreachable";
    case 404:
      return "not_found";
    default:
      return "engine_request_failed";
  }
}

export function engineErrorBody(err: EngineError): { error: EngineErrorCode; message: string } {
  return { error: engineErrorCode(err), message: err.message };
}

/** Reply with the mapped engine error, or rethrow anything that is not one. */
export function sendEngineError(reply: FastifyReply, err: unknown) {
  if (err instanceof EngineError) {
    return reply.status(err.statusCode).send(engineErrorBody(err));
  }
  throw err;
}
