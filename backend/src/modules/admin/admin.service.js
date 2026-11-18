import { prisma } from "../../config/prisma.js";
import {
  adminUserInclude,
  projectSummaryInclude,
  providerAdminInclude,
} from "../../config/includes.js";
import { conflict, notFound } from "../../utils/errors.js";
import { relativeTime } from "../../utils/dates.js";
import {
  serializeAdminUser,
  serializeProjectSummary,
  serializeVerificationCase,
} from "../../serializers/index.js";
import { emailVerificationDecision } from "../../services/email.js";

export const getStats = async () => {
  const [
    users,
    clients,
    providers,
    pendingVerifications,
    verifiedProviders,
    publishedProviders,
    projects,
    publishedProjects,
    hiddenProjects,
    requests,
    requested,
    accepted,
    completed,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.providerProfile.count(),
    prisma.providerProfile.count({ where: { verificationStatus: "PENDING" } }),
    prisma.providerProfile.count({ where: { verificationStatus: "VERIFIED" } }),
    prisma.providerProfile.count({ where: { published: true, verificationStatus: "VERIFIED" } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "PUBLISHED", adminHidden: false } }),
    prisma.project.count({ where: { adminHidden: true } }),
    prisma.demoRequest.count(),
    prisma.demoRequest.count({ where: { status: "REQUESTED" } }),
    prisma.demoRequest.count({ where: { status: "ACCEPTED" } }),
    prisma.demoRequest.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    users: { total: users, clients },
    providers: { total: providers, verified: verifiedProviders, published: publishedProviders },
    verifications: { pending: pendingVerifications },
    projects: { total: projects, published: publishedProjects, hidden: hiddenProjects },
    requests: { total: requests, requested, accepted, completed },
  };
};

export const listVerifications = async (filters) => {
  const { page, pageSize, status } = filters;
  const where = status ? { verificationStatus: status } : { verificationStatus: { in: ["PENDING", "VERIFIED", "REJECTED"] } };
  const [total, providers, groups] = await prisma.$transaction([
    prisma.providerProfile.count({ where }),
    prisma.providerProfile.findMany({
      where,
      include: providerAdminInclude,
      orderBy: [{ verificationSubmittedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.providerProfile.groupBy({
      by: ["verificationStatus"],
      _count: { _all: true },
    }),
  ]);

  const counts = { UNVERIFIED: 0, PENDING: 0, VERIFIED: 0, REJECTED: 0 };
  for (const group of groups) counts[group.verificationStatus] = group._count._all;

  return { total, providers, counts };
};

export const decideVerification = async (providerId, input) => {
  const existing = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    select: { id: true },
  });
  if (!existing) throw notFound("Practice not found");

  const provider = await prisma.providerProfile.update({
    where: { id: providerId },
    data: {
      verificationStatus: input.status,
      verificationReviewedAt: new Date(),
      verificationNote: input.note ?? null,
      ...(input.status === "REJECTED" ? { published: false } : {}),
    },
    include: providerAdminInclude,
  });

  await emailVerificationDecision(provider, input.status, input.note);
  return serializeVerificationCase(provider);
};

export const listUsers = async (filters) => {
  const { page, pageSize, q, role, status, verification } = filters;
  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(verification ? { provider: { verificationStatus: verification } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { provider: { firm: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      include: adminUserInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return { total, users };
};

export const setUserStatus = async (adminId, userId, status) => {
  if (adminId === userId && status === "SUSPENDED") {
    throw conflict("You cannot suspend your own admin account");
  }
  const user = await prisma.user.findUnique({ where: { id: userId }, include: adminUserInclude });
  if (!user) throw notFound("Account not found");

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status },
    include: adminUserInclude,
  });
  if (status === "SUSPENDED") {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  return serializeAdminUser(updated);
};

export const listProjects = async (filters) => {
  const { page, pageSize, q, status, hidden } = filters;
  const where = {
    ...(status ? { status } : {}),
    ...(hidden !== undefined ? { adminHidden: hidden } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { provider: { firm: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [total, projects, groups] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectSummaryInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = { total: 0, DRAFT: 0, PUBLISHED: 0, HIDDEN: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.total += group._count._all;
  }

  return { total, projects, counts };
};

export const serializeAdminProject = (project) => ({
  ...serializeProjectSummary(project),
  providerEmail: project.provider?.user?.email ?? null,
  providerStatus: project.provider?.verificationStatus ?? null,
  imagesCount: project.images?.length ?? 0,
});

export const setProjectVisibility = async (projectId, adminHidden) => {
  const existing = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!existing) throw notFound("Project not found");
  const project = await prisma.project.update({
    where: { id: projectId },
    data: { adminHidden },
    include: projectSummaryInclude,
  });
  return serializeAdminProject(project);
};

export const getActivity = async () => {
  const [providers, projects, requests] = await Promise.all([
    prisma.providerProfile.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { user: { select: { name: true } } },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        provider: { select: { firm: true } },
        _count: { select: { images: true } },
      },
    }),
    prisma.demoRequest.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        provider: { select: { firm: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  const events = [];

  for (const provider of providers) {
    if (provider.verificationStatus === "VERIFIED") {
      events.push({
        title: `${provider.firm} approved`,
        detail: `${provider.registrationNumber || "Verified practice"} · ${provider.city}`,
        time: relativeTime(provider.verificationReviewedAt ?? provider.updatedAt),
        date: provider.verificationReviewedAt ?? provider.updatedAt,
        tone: "verified",
      });
    } else if (provider.verificationStatus === "PENDING") {
      events.push({
        title: "Verification submitted",
        detail: `${provider.firm} · ${provider.city}`,
        time: relativeTime(provider.verificationSubmittedAt ?? provider.updatedAt),
        date: provider.verificationSubmittedAt ?? provider.updatedAt,
        tone: "warning",
      });
    } else if (provider.verificationStatus === "REJECTED") {
      events.push({
        title: "Verification rejected",
        detail: `${provider.firm} · ${provider.city}`,
        time: relativeTime(provider.verificationReviewedAt ?? provider.updatedAt),
        date: provider.verificationReviewedAt ?? provider.updatedAt,
        tone: "warning",
      });
    }
  }

  for (const project of projects) {
    events.push({
      title: project.status === "PUBLISHED" ? "New monograph published" : "Project draft updated",
      detail: `${project.title} · ${project._count.images} media`,
      time: relativeTime(project.updatedAt),
      date: project.updatedAt,
      tone: "neutral",
    });
  }

  for (const request of requests) {
    if (request.status === "ACCEPTED") {
      events.push({
        title: "Commission accepted",
        detail: `${request.provider.firm} · ${request.projectType}`,
        time: relativeTime(request.updatedAt),
        date: request.updatedAt,
        tone: "verified",
      });
    } else if (request.status === "REQUESTED") {
      events.push({
        title: "New request received",
        detail: `${request.user.name} · ${request.provider.firm}`,
        time: relativeTime(request.createdAt),
        date: request.createdAt,
        tone: "neutral",
      });
    }
  }

  return events
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)
    .map(({ date: _date, ...event }) => event);
};
