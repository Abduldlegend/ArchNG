import { Router } from "express";
import { loginSchema, registerSchema } from "@archng/shared";
import { authenticate } from "../../middleware/auth.js";
import { authLimiter } from "../../middleware/rate-limit.js";
import { validate } from "../../middleware/validate.js";
import * as controller from "./auth.controller.js";

export const authRoutes = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Create a client or provider account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *               role: { type: string, enum: [USER, PROVIDER] }
 *               firm: { type: string }
 *               city: { type: string }
 *               state: { type: string }
 *     responses:
 *       201: { description: Account created }
 */
authRoutes.post("/register", authLimiter, validate(registerSchema), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Sign in and receive an access token plus refresh cookie
 *     responses:
 *       200: { description: Signed in }
 */
authRoutes.post("/login", authLimiter, validate(loginSchema), controller.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Rotate the refresh cookie and issue a new access token
 *     responses:
 *       200: { description: Refreshed }
 */
authRoutes.post("/refresh", authLimiter, controller.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke the refresh session
 *     responses:
 *       204: { description: Signed out }
 */
authRoutes.post("/logout", controller.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     summary: Get the signed-in account
 *     responses:
 *       200: { description: Current user }
 */
authRoutes.get("/me", authenticate, controller.me);
