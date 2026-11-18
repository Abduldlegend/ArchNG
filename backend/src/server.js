import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

const start = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("database.connected");
  } catch (error) {
    logger.error("database.unavailable", { error: error?.message });
    process.exitCode = 1;
    return;
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info("server.started", {
      port: env.PORT,
      environment: env.NODE_ENV,
      docs: env.IS_PRODUCTION ? null : `${env.PUBLIC_API_URL}/api/docs`,
    });
  });

  const shutdown = async (signal) => {
    logger.info("server.stopping", { signal });
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
};

start();
