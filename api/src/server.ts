import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { prisma } from "./db/prisma.js";
import { eventRoutes } from "./routes/events.js";
import { accountRoutes } from "./routes/accounts.js";
import { ringRoutes } from "./routes/rings.js";
import { graphRoutes } from "./routes/graph.js";

async function main() {
  const app = Fastify({ logger: true, bodyLimit: config.bodyLimitBytes });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok" }));

  await app.register(eventRoutes);
  await app.register(accountRoutes);
  await app.register(ringRoutes);
  await app.register(graphRoutes);

  await app.listen({ port: config.port, host: config.host });

  // Render (and any container host) stops the service with SIGTERM. Finish
  // in-flight requests and release the Postgres connection instead of
  // dying mid-write.
  for (const signal of ["SIGTERM", "SIGINT"] as const) {
    process.once(signal, async () => {
      app.log.info({ signal }, "shutting down");
      await app.close();
      await prisma.$disconnect();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
