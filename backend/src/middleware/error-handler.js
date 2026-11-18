import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `No route matches ${req.method} ${req.originalUrl}`,
    },
  });
};

export const errorHandler = (error, req, res, _next) => {
  if (res.headersSent) return;

  if (error instanceof ZodError) {
    return res.status(422).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the highlighted fields",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }

  if (error instanceof AppError) {
    return res.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    });
  }

  if (error?.code === "P2002") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "That value is already in use",
        details: error.meta?.target,
      },
    });
  }

  if (error?.code === "P2025") {
    return res.status(404).json({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    });
  }

  if (error?.code === "P2003") {
    return res.status(409).json({
      error: {
        code: "CONFLICT",
        message: "This record is still linked to other data",
      },
    });
  }

  if (error?.type === "entity.parse.failed" || error instanceof SyntaxError) {
    return res.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "The request body is not valid JSON",
      },
    });
  }

  logger.error("Unhandled request error", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    error: error?.stack || String(error),
  });

  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: env.IS_PRODUCTION ? "Something went wrong" : error?.message || "Something went wrong",
    },
  });
};
