import argon2 from "argon2";
import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { conflict, forbidden, unauthorized, unprocessable } from "../../utils/errors.js";
import { slugify, uniqueSlug } from "../../utils/strings.js";
import {
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../utils/tokens.js";

const userWithProvider = {
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

const createRefreshTokenRecord = async (userId, token, req) => {
  await prisma.refreshToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashRefreshToken(token),
      expiresAt,
      userAgent: req.headers["user-agent"]?.slice(0, 300) || null,
      ip: req.ip || null,
    },
  });
};

const startSession = async (user, req) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await createRefreshTokenRecord(user.id, refreshToken, req);
  return {
    accessToken,
    refreshToken,
    expiresIn: env.ACCESS_TOKEN_TTL,
    tokenType: "Bearer",
  };
};

export const register = async (input, req) => {
  if (input.role === "PROVIDER" && !input.firm) {
    throw unprocessable("Add a practice name to create a provider account", { firm: "Practice name is required" });
  }

  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict("An account with that email already exists");

  const passwordHash = await argon2.hash(input.password);
  const slug = await uniqueSlug(input.firm || `${input.name} Studio`, async (candidate) =>
    Boolean(await prisma.providerProfile.findUnique({ where: { slug: candidate }, select: { id: true } })),
  );

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      ...(input.role === "PROVIDER"
        ? {
            provider: {
              create: {
                slug,
                firm: input.firm,
                city: input.city || "Lagos",
                state: input.state || "Lagos",
                contactEmail: input.email,
                verificationStatus: "UNVERIFIED",
                published: false,
              },
            },
          }
        : {}),
    },
    select: userWithProvider,
  });

  const session = await startSession(user, req);
  return { user, session };
};

export const login = async (input, req) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...userWithProvider, passwordHash: true },
  });
  if (!user) throw unauthorized("Email or password is incorrect");
  if (user.status === "SUSPENDED") throw forbidden("This account has been suspended");

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) throw unauthorized("Email or password is incorrect");

  const { passwordHash: _passwordHash, ...safeUser } = user;
  const session = await startSession(safeUser, req);
  return { user: safeUser, session };
};

export const refresh = async (token, req) => {
  if (!token) throw unauthorized("No refresh session found");
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw unauthorized("Your refresh session has expired");
  }
  if (payload.type !== "refresh" || !payload.sub) throw unauthorized("Invalid refresh session");

  const tokenHash = hashRefreshToken(token);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record || record.revokedAt || record.expiresAt <= new Date()) {
    throw unauthorized("Your refresh session has expired");
  }

  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: userWithProvider,
  });
  if (!user) throw unauthorized("Account no longer exists");
  if (user.status === "SUSPENDED") throw forbidden("This account has been suspended");

  const newRefreshToken = signRefreshToken(user);
  await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: { id: record.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (revoked.count !== 1) throw unauthorized("This refresh session has already been used");
    await tx.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(newRefreshToken),
        expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
        userAgent: req.headers["user-agent"]?.slice(0, 300) || null,
        ip: req.ip || null,
      },
    });
  });

  return {
    user,
    session: {
      accessToken: signAccessToken(user),
      refreshToken: newRefreshToken,
      expiresIn: env.ACCESS_TOKEN_TTL,
      tokenType: "Bearer",
    },
  };
};

export const logout = async (token) => {
  if (!token) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userWithProvider });
  if (!user) throw unauthorized("Account no longer exists");
  return user;
};

export const makeProviderSlug = (firm) => slugify(firm);

