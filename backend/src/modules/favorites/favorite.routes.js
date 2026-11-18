import { Router } from "express";
import { favoriteCreateSchema, paginationSchema, providerIdParamSchema } from "@archng/shared";
import { authenticate } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { asyncHandler } from "../../utils/http.js";
import * as controller from "./favorite.controller.js";

export const favoriteMeRoutes = Router();
favoriteMeRoutes.use(authenticate);

favoriteMeRoutes.get("/favorites", validate(paginationSchema, "query"), asyncHandler(controller.list));

/**
 * @openapi
 * /me/favorites:
 *   post:
 *     tags: [Favorites]
 *     security: [{ bearerAuth: [] }]
 *     summary: Save a practice
 *     responses:
 *       201: { description: Saved }
 */
favoriteMeRoutes.post("/favorites", validate(favoriteCreateSchema), asyncHandler(controller.add));

favoriteMeRoutes.delete(
  "/favorites/:providerId",
  validate(providerIdParamSchema, "params"),
  asyncHandler(controller.remove),
);
