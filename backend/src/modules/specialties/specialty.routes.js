import { Router } from "express";
import { asyncHandler } from "../../utils/http.js";
import * as controller from "./specialty.controller.js";

export const specialtyRoutes = Router();

/**
 * @openapi
 * /specialties:
 *   get:
 *     tags: [Specialties]
 *     summary: List practice specialties with verified provider counts
 *     responses:
 *       200: { description: Specialties }
 */
specialtyRoutes.get("/", asyncHandler(controller.list));
