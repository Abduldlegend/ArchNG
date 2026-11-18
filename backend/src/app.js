import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { openapiSpec } from "./config/swagger.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { apiLimiter } from "./middleware/rate-limit.js";
import { requestContext } from "./middleware/request-context.js";
import { apiRoutes } from "./routes.js";
import { healthHandler } from "./modules/health.js";
import { ensureUploadRoot, uploadRoot } from "./services/storage.js";
import { AppError } from "./utils/errors.js";

const here = dirname(fileURLToPath(import.meta.url));

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (env.CORS_ORIGINS.includes("*") || env.CORS_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new AppError(403, "CORS_ORIGIN_BLOCKED", "This origin is not allowed to call the API"));
  },
};

export const createApp = () => {
  void ensureUploadRoot().catch(() => {});

  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(requestContext);
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false, limit: "1mb" }));
  app.use(cookieParser());

  app.use("/uploads", express.static(uploadRoot, { maxAge: "1d", fallthrough: true }));

  app.get("/health", healthHandler);
  app.use("/api/v1", apiLimiter, apiRoutes);

  if (!env.IS_PRODUCTION) {
    app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: "ArchNG API" }));
    app.get("/api/docs.json", (_req, res) => res.json(openapiSpec));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export const appRoot = here;
