import { serializeAuthUser } from "../../serializers/index.js";
import { asyncHandler, created, ok } from "../../utils/http.js";
import {
  REFRESH_COOKIE_NAME,
  clearRefreshCookie,
  setRefreshCookie,
} from "../../utils/tokens.js";
import * as authService from "./auth.service.js";

const sessionPayload = (result) => ({
  user: serializeAuthUser(result.user),
  accessToken: result.session.accessToken,
  expiresIn: result.session.expiresIn,
  tokenType: result.session.tokenType,
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body, req);
  setRefreshCookie(res, result.session.refreshToken);
  return created(res, sessionPayload(result));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body, req);
  setRefreshCookie(res, result.session.refreshToken);
  return ok(res, sessionPayload(result));
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refresh(req.cookies?.[REFRESH_COOKIE_NAME], req);
  setRefreshCookie(res, result.session.refreshToken);
  return ok(res, sessionPayload(result));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.cookies?.[REFRESH_COOKIE_NAME]);
  clearRefreshCookie(res);
  return res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  return ok(res, serializeAuthUser(user));
});
