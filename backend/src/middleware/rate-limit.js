import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { tooManyRequests } from "../utils/errors.js";

const skip = () => env.IS_TEST;

const handler = (_req, _res, next) => next(tooManyRequests());

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  handler,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  handler,
});

export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 180,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip,
  handler,
});
