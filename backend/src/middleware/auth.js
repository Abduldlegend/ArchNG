import { prisma } from "../config/prisma.js";
import { forbidden, unauthorized } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/tokens.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  provider: {
    select: {
      id: true,
      slug: true,
      firm: true,
      verificationStatus: true,
      published: true,
    },
  },
};

const getBearerToken = (req) => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const resolveUser = async (token) => {
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw unauthorized("Your session has expired");
  }
  if (payload.type !== "access" || !payload.sub) throw unauthorized("Invalid access token");

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: userSelect,
  });
  if (!user) throw unauthorized("Account no longer exists");
  if (user.status === "SUSPENDED") throw forbidden("This account has been suspended");
  return user;
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = getBearerToken(req);
    req.user = token ? await resolveUser(token) : null;
    next();
  } catch (error) {
    next(error);
  }
};

export const authenticate = async (req, _res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) throw unauthorized();
    req.user = await resolveUser(token);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden("This action is not available for your role"));
  return next();
};

export const requireProvider = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== "PROVIDER" || !req.user.provider) {
    return next(forbidden("Create a provider profile before continuing"));
  }
  return next();
};

export const requireAdmin = (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== "ADMIN") return next(forbidden("Admin access required"));
  return next();
};
