import { Router } from "express";
import {
  idOrSlugParamSchema,
  idParamSchema,
  myProjectQuerySchema,
  projectCreateSchema,
  projectListQuerySchema,
  projectUpdateSchema,
} from "@archng/shared";
import { authenticate, optionalAuth, requireProvider } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/http.js";
import * as controller from "./project.controller.js";

export const projectRoutes = Router();

/**
 * @openapi
 * /projects:
 *   get:
 *     tags: [Projects]
 *     summary: Browse published monographs
 *     responses:
 *       200: { description: Paginated projects }
 */
projectRoutes.get("/", validate(projectListQuerySchema, "query"), asyncHandler(controller.list));

/**
 * @openapi
 * /projects/{idOrSlug}:
 *   get:
 *     tags: [Projects]
 *     summary: Get a project by id or slug
 *     parameters:
 *       - { in: path, name: idOrSlug, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Project detail }
 *       404: { description: Not found }
 */
projectRoutes.get(
  "/:idOrSlug",
  validate(idOrSlugParamSchema, "params"),
  optionalAuth,
  asyncHandler(controller.get),
);

export const projectMeRoutes = Router();

projectMeRoutes.use(authenticate);

projectMeRoutes.get(
  "/projects",
  requireProvider,
  validate(myProjectQuerySchema, "query"),
  asyncHandler(controller.listMine),
);
projectMeRoutes.post(
  "/projects",
  requireProvider,
  validate(projectCreateSchema),
  asyncHandler(controller.create),
);
projectMeRoutes.get(
  "/projects/:id",
  requireProvider,
  validate(idParamSchema, "params"),
  asyncHandler(controller.getMine),
);
projectMeRoutes.patch(
  "/projects/:id",
  requireProvider,
  validate(idParamSchema, "params"),
  validate(projectUpdateSchema),
  asyncHandler(controller.update),
);
projectMeRoutes.delete(
  "/projects/:id",
  requireProvider,
  validate(idParamSchema, "params"),
  asyncHandler(controller.remove),
);
