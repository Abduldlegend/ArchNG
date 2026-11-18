import { prisma } from "../../config/prisma.js";
import { requestClientInclude } from "../../config/includes.js";
import { conflict, forbidden, notFound, unprocessable } from "../../utils/errors.js";
import { serializeLead, serializeRequest } from "../../serializers/index.js";
import { emailNewRequest, emailRequestStatus, sendEmail } from "../../services/email.js";

const findProvider = async (input) => {
  if (input.providerId) {
    return prisma.providerProfile.findUnique({
      where: { id: input.providerId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
  return prisma.providerProfile.findUnique({
    where: { slug: input.providerSlug },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

export const createRequest = async (userId, input) => {
  const provider = await findProvider(input);
  if (!provider) throw notFound("Practice not found");
  if (!provider.published || provider.verificationStatus !== "VERIFIED") {
    throw unprocessable("This practice is not currently accepting requests");
  }
  if (!provider.acceptingLeads) {
    throw unprocessable("This practice has paused new requests");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });
  if (!user) throw notFound("Account not found");

  const existing = await prisma.demoRequest.findFirst({
    where: {
      userId,
      providerId: provider.id,
      projectType: input.projectType,
      status: { in: ["REQUESTED", "ACCEPTED"] },
    },
    select: { id: true },
  });
  if (existing) {
    throw conflict("You already have an active request with this practice for this project type");
  }

  let request;
  try {
    request = await prisma.demoRequest.create({
      data: {
        userId,
        providerId: provider.id,
        projectType: input.projectType,
        state: input.state,
        location: input.location ?? null,
        budgetRange: input.budgetRange,
        brief: input.brief,
        status: "REQUESTED",
      },
      include: requestClientInclude,
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw conflict("You already have an active request with this practice for this project type");
    }
    throw error;
  }

  await emailNewRequest({ provider, client: user, request });
  return {
    request: serializeRequest(request),
    provider: {
      id: provider.id,
      name: provider.user?.name ?? provider.firm,
      firm: provider.firm,
      slug: provider.slug,
    },
  };
};

export const listMyRequests = async (userId, filters) => {
  const where = { userId, ...(filters.status ? { status: filters.status } : {}) };
  const [total, requests, groups] = await prisma.$transaction([
    prisma.demoRequest.count({ where }),
    prisma.demoRequest.findMany({
      where,
      include: requestClientInclude,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.demoRequest.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const counts = { total: 0, REQUESTED: 0, ACCEPTED: 0, DECLINED: 0, CANCELLED: 0, COMPLETED: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.total += group._count._all;
  }

  return { total, requests, counts };
};

export const getMyRequest = async (userId, id) => {
  const request = await prisma.demoRequest.findFirst({
    where: { id, userId },
    include: requestClientInclude,
  });
  if (!request) throw notFound("Request not found");
  return serializeRequest(request);
};

export const cancelMyRequest = async (userId, id) => {
  const request = await prisma.demoRequest.findFirst({
    where: { id, userId },
    include: requestClientInclude,
  });
  if (!request) throw notFound("Request not found");
  if (!["REQUESTED", "ACCEPTED"].includes(request.status)) {
    throw conflict("This request can no longer be cancelled");
  }

  const updated = await prisma.demoRequest.update({
    where: { id },
    data: { status: "CANCELLED", providerNote: request.providerNote },
    include: requestClientInclude,
  });

  if (request.provider?.user?.email && request.user) {
    await sendEmail({
      to: request.provider.user.email,
      subject: `${request.user.name} cancelled their ArchNG request`,
      text: `Hello ${request.provider.firm},\n\n${request.user.name} has cancelled their ${request.projectType} request for ${request.state}.\n\nArchNG`,
    });
  }
  return serializeRequest(updated);
};

export const listLeads = async (userId, filters) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!provider) throw notFound("Provider profile not found");
  const where = { providerId: provider.id, ...(filters.status ? { status: filters.status } : {}) };

  const [total, requests, groups] = await prisma.$transaction([
    prisma.demoRequest.count({ where }),
    prisma.demoRequest.findMany({
      where,
      include: requestClientInclude,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.demoRequest.groupBy({
      by: ["status"],
      where: { providerId: provider.id },
      _count: { _all: true },
    }),
  ]);

  const counts = { total: 0, REQUESTED: 0, ACCEPTED: 0, DECLINED: 0, CANCELLED: 0, COMPLETED: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.total += group._count._all;
  }

  return { total, requests, counts };
};

export const getLead = async (userId, id) => {
  const request = await prisma.demoRequest.findFirst({
    where: { id, provider: { userId } },
    include: requestClientInclude,
  });
  if (!request) throw notFound("Request not found");
  return serializeLead(request);
};

const allowedTransitions = {
  REQUESTED: ["ACCEPTED", "DECLINED"],
  ACCEPTED: ["COMPLETED", "DECLINED"],
  DECLINED: [],
  CANCELLED: [],
  COMPLETED: [],
};

export const updateLead = async (userId, id, input) => {
  const request = await prisma.demoRequest.findFirst({
    where: { id, provider: { userId } },
    include: requestClientInclude,
  });
  if (!request) throw notFound("Request not found");
  if (input.status === request.status) {
    return serializeLead(request);
  }
  if (!allowedTransitions[request.status]?.includes(input.status)) {
    throw conflict(`A ${request.status.toLowerCase()} request cannot be marked ${input.status.toLowerCase()}`);
  }
  if (input.status === "DECLINED" && !input.note) {
    throw unprocessable("Add a short note so the client understands why");
  }

  const updated = await prisma.demoRequest.update({
    where: { id },
    data: {
      status: input.status,
      providerNote: input.note ?? request.providerNote,
      videoAccessGrantedAt: ["ACCEPTED", "COMPLETED"].includes(input.status)
        ? request.videoAccessGrantedAt ?? new Date()
        : request.videoAccessGrantedAt,
    },
    include: requestClientInclude,
  });

  if (updated.user?.email) {
    await emailRequestStatus({ client: updated.user, provider: updated.provider, request: updated });
  }
  return serializeLead(updated);
};

export const getRequestForAdmin = async (id) => {
  const request = await prisma.demoRequest.findUnique({
    where: { id },
    include: requestClientInclude,
  });
  if (!request) throw notFound("Request not found");
  return serializeRequest(request);
};

export const assertOwnRequest = async (userId, id) => {
  const request = await prisma.demoRequest.findFirst({ where: { id, userId }, select: { id: true } });
  if (!request) throw forbidden("Request does not belong to this account");
  return request;
};
