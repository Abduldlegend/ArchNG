import express, { Router } from "express";
import { uploadSignSchema } from "@archng/shared";
import { authenticate, requireRole } from "../../middleware/auth.js";
import { writeLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import { created, ok } from "../../utils/http.js";
import { asyncHandler } from "../../utils/http.js";
import { getStorageInfo, signUpload, writeLocalUpload } from "../../services/storage.js";

export const uploadRoutes = Router();

/**
 * @openapi
 * /uploads/sign:
 *   post:
 *     tags: [Uploads]
 *     security: [{ bearerAuth: [] }]
 *     summary: Create a signed local or Cloudinary upload
 *     responses:
 *       200: { description: Signed upload details }
 */
uploadRoutes.post(
  "/sign",
  authenticate,
  requireRole("PROVIDER", "ADMIN"),
  writeLimiter,
  validate(uploadSignSchema),
  asyncHandler(async (req, res) => {
    const result = await signUpload(req.body);
    return ok(res, { ...result, storage: getStorageInfo() });
  }),
);

uploadRoutes.put(
  "/local/:token",
  express.raw({ type: () => true, limit: "45mb" }),
  writeLimiter,
  asyncHandler(async (req, res) => {
    const result = await writeLocalUpload({
      token: req.params.token,
      buffer: req.body,
      contentType: req.headers["content-type"],
    });
    return created(res, result, { provider: "local" });
  }),
);
