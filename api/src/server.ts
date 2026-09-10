import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { eventRoutes } from "./routes/events.js";

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(eventRoutes);

  await app.listen({ port: config.port, host: config.host });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
