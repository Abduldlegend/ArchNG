import { Router } from "express";
import {
  demoVideoUpdateSchema,
  providerListQuerySchema,
  providerProfileUpdateSchema,
  verificationSubmitSchema,
} from "@archng/shared";
import { authenticate, optionalAuth, requireProvider } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/http.js";
import * as controller from "./provider.controller.js";

export const providerRoutes = Router();

/**
 * @openapi
 * /providers:
 *   get:
 *     tags: [Providers]
 *     summary: Browse verified practices
 *     parameters:
 *       - { in: query, name: q, schema: { type: string } }
 *       - { in: query, name: state, schema: { type: string } }
 *       - { in: query, name: specialty, schema: { type: string } }
 *       - { in: query, name: demo, schema: { type: boolean } }
 *       - { in: query, name: minYears, schema: { type: integer } }
 *       - { in: query, name: maxYears, schema: { type: integer } }
 *     responses:
 *       200: { description: Paginated providers }
 */
providerRoutes.get("/", validate(providerListQuerySchema, "query"), asyncHandler(controller.list));

/**
 * @openapi
 * /providers/{slug}:
 *   get:
 *     tags: [Providers]
 *     summary: Get a provider profile, gated for anonymous visitors
 *     parameters:
 *       - { in: path, name: slug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Public provider profile }
 *       404: { description: Not found }
 */
providerRoutes.get("/:idOrSlug", optionalAuth, asyncHandler(controller.get));

/**
 * @openapi
 * /providers/{slug}/gated:
 *   get:
 *     tags: [Providers]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get contact, video and registration details after an accepted request
 *     responses:
 *       200: { description: Gated details }
 *       403: { description: Access denied }
 */
providerRoutes.get("/:idOrSlug/gated", authenticate, asyncHandler(controller.getGated));

export const providerMeRoutes = Router();

providerMeRoutes.use(authenticate);

providerMeRoutes.get("/provider-profile", requireProvider, asyncHandler(controller.getMine));
providerMeRoutes.patch(
  "/provider-profile",
  requireProvider,
  validate(providerProfileUpdateSchema),
  asyncHandler(controller.updateMine),
);
providerMeRoutes.post(
  "/provider-profile/verification",
  requireProvider,
  validate(verificationSubmitSchema),
  asyncHandler(controller.submitVerification),
);
providerMeRoutes.put(
  "/demo-video",
  requireProvider,
  validate(demoVideoUpdateSchema),
  asyncHandler(controller.setDemoVideo),
);
providerMeRoutes.get("/provider/stats", requireProvider, asyncHandler(controller.stats));
