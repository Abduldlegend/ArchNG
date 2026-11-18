import { Router } from "express";
import {
  demoRequestCreateSchema,
  idParamSchema,
  providerLeadQuerySchema,
  requestListQuerySchema,
  requestStatusUpdateSchema,
} from "@archng/shared";
import { authenticate, requireProvider } from "../../middleware/auth.js";
import { writeLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/http.js";
import * as controller from "./request.controller.js";

export const requestRoutes = Router();

/**
 * @openapi
 * /demo-requests:
 *   post:
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     summary: Send a demo request to a verified practice
 *     responses:
 *       201: { description: Request created }
 *       409: { description: Duplicate active request }
 */
requestRoutes.post(
  "/demo-requests",
  authenticate,
  writeLimiter,
  validate(demoRequestCreateSchema),
  asyncHandler(controller.create),
);

export const requestMeRoutes = Router();
requestMeRoutes.use(authenticate);

requestMeRoutes.get(
  "/demo-requests",
  validate(requestListQuerySchema, "query"),
  asyncHandler(controller.listMine),
);
requestMeRoutes.get("/demo-requests/:id", validate(idParamSchema, "params"), asyncHandler(controller.getMine));
requestMeRoutes.post(
  "/demo-requests/:id/cancel",
  validate(idParamSchema, "params"),
  asyncHandler(controller.cancelMine),
);

requestMeRoutes.get(
  "/leads",
  requireProvider,
  validate(providerLeadQuerySchema, "query"),
  asyncHandler(controller.listLeads),
);
requestMeRoutes.get(
  "/leads/:id",
  requireProvider,
  validate(idParamSchema, "params"),
  asyncHandler(controller.getLead),
);
requestMeRoutes.patch(
  "/leads/:id",
  requireProvider,
  validate(idParamSchema, "params"),
  validate(requestStatusUpdateSchema),
  asyncHandler(controller.updateLead),
);
