import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const healthHandler = async (_req, res) => {
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: "ok",
      service: "archng-api",
      environment: env.NODE_ENV,
      database: "ok",
      latencyMs: Date.now() - startedAt,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("health.database", { error: error?.message });
    return res.status(503).json({
      status: "degraded",
      service: "archng-api",
      environment: env.NODE_ENV,
      database: "unavailable",
      timestamp: new Date().toISOString(),
    });
  }
};
