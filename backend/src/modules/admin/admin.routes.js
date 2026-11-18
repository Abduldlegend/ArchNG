import { Router } from "express";
import {
  adminProjectQuerySchema,
  adminProjectVisibilitySchema,
  adminUserQuerySchema,
  adminUserStatusSchema,
  idParamSchema,
  providerIdParamSchema,
  specialtyCreateSchema,
  verificationDecisionSchema,
  verificationListQuerySchema,
} from "@archng/shared";
import { authenticate, requireAdmin } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/http.js";
import { create as createSpecialty } from "../specialties/specialty.controller.js";
import * as controller from "./admin.controller.js";

export const adminRoutes = Router();
adminRoutes.use(authenticate, requireAdmin);

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     summary: Platform totals for the admin dashboard
 *     responses:
 *       200: { description: Dashboard stats }
 */
adminRoutes.get("/stats", asyncHandler(controller.stats));

adminRoutes.get(
  "/verifications",
  validate(verificationListQuerySchema, "query"),
  asyncHandler(controller.listVerifications),
);
adminRoutes.get(
  "/providers",
  validate(verificationListQuerySchema, "query"),
  asyncHandler(controller.listVerifications),
);
adminRoutes.patch(
  "/verifications/:providerId",
  validate(providerIdParamSchema, "params"),
  validate(verificationDecisionSchema),
  asyncHandler(controller.decideVerification),
);
adminRoutes.patch(
  "/providers/:providerId/verification",
  validate(providerIdParamSchema, "params"),
  validate(verificationDecisionSchema),
  asyncHandler(controller.decideVerification),
);
adminRoutes.post("/specialties", validate(specialtyCreateSchema), asyncHandler(createSpecialty));

adminRoutes.get("/users", validate(adminUserQuerySchema, "query"), asyncHandler(controller.listUsers));
adminRoutes.patch(
  "/users/:id/status",
  validate(idParamSchema, "params"),
  validate(adminUserStatusSchema),
  asyncHandler(controller.setUserStatus),
);

adminRoutes.get("/projects", validate(adminProjectQuerySchema, "query"), asyncHandler(controller.listProjects));
adminRoutes.patch(
  "/projects/:id",
  validate(idParamSchema, "params"),
  validate(adminProjectVisibilitySchema),
  asyncHandler(controller.setProjectVisibility),
);
adminRoutes.patch(
  "/projects/:id/visibility",
  validate(idParamSchema, "params"),
  validate(adminProjectVisibilitySchema),
  asyncHandler(controller.setProjectVisibility),
);

adminRoutes.get("/activity", asyncHandler(controller.activity));
