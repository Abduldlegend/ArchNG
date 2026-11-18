import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { sha256 } from "./strings.js";

export const ACCESS_TOKEN_TYPE = "access";
export const REFRESH_TOKEN_TYPE = "refresh";
export const REFRESH_COOKIE_NAME = "archng_refresh";
export const REFRESH_COOKIE_PATH = "/api/v1/auth";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, type: ACCESS_TOKEN_TYPE }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: "archng",
    audience: "archng-web",
  });

export const signRefreshToken = (user) =>
  jwt.sign({ sub: user.id, type: REFRESH_TOKEN_TYPE }, env.JWT_REFRESH_SECRET, {
    expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`,
    issuer: "archng",
    audience: "archng-web",
    jwtid: randomUUID(),
  });

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "archng",
    audience: "archng-web",
  });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "archng",
    audience: "archng-web",
  });

export const hashRefreshToken = (token) => sha256(token);

export const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
});

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, refreshCookieOptions());
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
  });
};
