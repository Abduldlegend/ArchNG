import { FEE_TIER_LABELS, SPECIALTY_NAMES, UUID_RE } from "@archng/shared";
import { prisma } from "../../config/prisma.js";
import { providerCardInclude, providerProfileInclude, projectDetailInclude } from "../../config/includes.js";
import { conflict, forbidden, notFound, unprocessable } from "../../utils/errors.js";
import { slugify } from "../../utils/strings.js";
import { serializeProviderProfile } from "../../serializers/index.js";
import { emailVerificationReceived } from "../../services/email.js";

const profileProjects = (providerId, access) =>
  prisma.project.findMany({
    where: {
      providerId,
      ...(access === "manage" ? {} : { status: "PUBLISHED", adminHidden: false }),
    },
    include: projectDetailInclude,
    orderBy: [{ year: "desc" }, { createdAt: "desc" }],
  });

export const providerAccessFor = async (provider, viewer) => {
  if (!viewer) return "public";
  if (viewer.role === "ADMIN") return "manage";
  if (viewer.provider?.id === provider.id) return "manage";
  const accepted = await prisma.demoRequest.findFirst({
    where: {
      userId: viewer.id,
      providerId: provider.id,
      status: { in: ["ACCEPTED", "COMPLETED"] },
    },
    select: { id: true },
  });
  return accepted ? "gated" : "public";
};

export const listProviders = async (filters) => {
  const { page, pageSize, q, state, specialty, feeTier, minYears, maxYears, demo, sort } = filters;
  const where = {
    published: true,
    verificationStatus: "VERIFIED",
    user: { status: "ACTIVE" },
    ...(state ? { state } : {}),
    ...(feeTier ? { feeTier } : {}),
    ...(minYears !== undefined || maxYears !== undefined
      ? {
          yearsExperience: {
            ...(minYears !== undefined ? { gte: minYears } : {}),
            ...(maxYears !== undefined ? { lte: maxYears } : {}),
          },
        }
      : {}),
    ...(demo === true ? { demoVideoUrl: { not: null } } : {}),
    ...(demo === false ? { demoVideoUrl: null } : {}),
    ...(specialty ? { specialties: { some: { name: specialty } } } : {}),
    ...(q
      ? {
          OR: [
            { firm: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { headline: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } },
            { specialties: { some: { name: { contains: q, mode: "insensitive" } } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "experience"
      ? [{ yearsExperience: "desc" }, { worksCount: "desc" }]
      : sort === "projects"
        ? [{ worksCount: "desc" }, { yearsExperience: "desc" }]
        : sort === "name"
          ? [{ firm: "asc" }]
          : [{ worksCount: "desc" }, { yearsExperience: "desc" }];

  const [total, providers] = await prisma.$transaction([
    prisma.providerProfile.count({ where }),
    prisma.providerProfile.findMany({
      where,
      include: providerCardInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, providers };
};

const findProvider = async (idOrSlug) => {
  const where = UUID_RE.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
  return prisma.providerProfile.findUnique({
    where,
    include: providerProfileInclude,
  });
};

export const getProvider = async (idOrSlug, viewer) => {
  const provider = await findProvider(idOrSlug);
  if (!provider) throw notFound("Practice not found");

  const access = await providerAccessFor(provider, viewer);
  if (access !== "manage" && (provider.user?.status !== "ACTIVE" || !provider.published || provider.verificationStatus !== "VERIFIED")) {
    throw notFound("Practice not found");
  }

  const projects = await profileProjects(provider.id, access);
  if (access !== "manage") {
    await prisma.providerProfile.update({
      where: { id: provider.id },
      data: { profileViews: { increment: 1 } },
    });
    provider.profileViews += 1;
  }

  return {
    provider: serializeProviderProfile(provider, { access, projects }),
    access,
  };
};

export const getGatedProvider = async (idOrSlug, viewer) => {
  const provider = await findProvider(idOrSlug);
  if (!provider) throw notFound("Practice not found");
  const access = await providerAccessFor(provider, viewer);
  if (access === "public") throw forbidden("An accepted request is required to view these details");
  const projects = await profileProjects(provider.id, access);
  return {
    provider: serializeProviderProfile(provider, { access, projects }),
    access,
  };
};

export const getMyProvider = async (userId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: providerProfileInclude,
  });
  if (!provider) throw notFound("Provider profile not found");
  const projects = await profileProjects(provider.id, "manage");
  return serializeProviderProfile(provider, { access: "manage", projects });
};

const cleanNullable = (value) => {
  if (value === undefined) return undefined;
  if (value === "") return null;
  return value;
};

const demoVideoSourceFor = (url) => {
  if (!url) return null;
  const host = new URL(url).hostname.toLowerCase();
  if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
  if (host === "vimeo.com" || host.endsWith(".vimeo.com")) return "vimeo";
  return null;
};

export const updateMyProvider = async (userId, input) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw notFound("Provider profile not found");

  if (input.specialties) {
    const unknown = input.specialties.filter((name) => !SPECIALTY_NAMES.includes(name));
    if (unknown.length > 0) throw unprocessable("Unknown specialty", { unknown });
  }

  if (input.published === true) {
    if (provider.verificationStatus !== "VERIFIED") {
      throw forbidden("Your practice must be verified before it can be published");
    }
    const missing = [];
    if (!(input.firm ?? provider.firm)) missing.push("firm");
    if (!(input.bio ?? provider.bio)) missing.push("bio");
    if (!(input.city ?? provider.city)) missing.push("city");
    if (!(input.state ?? provider.state)) missing.push("state");
    if (missing.length > 0) throw unprocessable("Complete your profile before publishing", { missing });
  }

  const data = {
    firm: input.firm,
    headline: input.headline,
    bio: input.bio,
    city: input.city,
    state: input.state,
    yearsExperience: input.yearsExperience,
    feeTier: input.feeTier,
    portraitUrl: cleanNullable(input.portraitUrl),
    coverUrl: cleanNullable(input.coverUrl),
    contactEmail: cleanNullable(input.contactEmail),
    contactPhone: cleanNullable(input.contactPhone),
    whatsapp: cleanNullable(input.whatsapp),
    website: cleanNullable(input.website),
    showEmailToAccepted: input.showEmailToAccepted,
    showPhoneToAccepted: input.showPhoneToAccepted,
    publishResponseWindow: input.publishResponseWindow,
    demoVideoUrl: cleanNullable(input.demoVideoUrl),
    demoVideoSource:
      input.demoVideoUrl === undefined
        ? undefined
        : demoVideoSourceFor(input.demoVideoUrl || null),
    registrationNumber: input.registrationNumber,
    licenceExpiresAt: input.licenceExpiresAt,
    acceptingLeads: input.acceptingLeads,
    published: input.published,
    ...(input.specialties
      ? { specialties: { set: input.specialties.map((name) => ({ name })) } }
      : {}),
    ...(input.experiences
      ? {
          experiences: {
            deleteMany: {},
            create: input.experiences.map(({ id: _id, ...experience }) => experience),
          },
        }
      : {}),
  };

  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  await prisma.providerProfile.update({ where: { id: provider.id }, data });
  return getMyProvider(userId);
};

export const setDemoVideo = async (userId, url) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!provider) throw notFound("Provider profile not found");
  const normalized = url || null;
  await prisma.providerProfile.update({
    where: { id: provider.id },
    data: { demoVideoUrl: normalized, demoVideoSource: demoVideoSourceFor(normalized) },
  });
  return getMyProvider(userId);
};

export const submitVerification = async (userId, input) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  });
  if (!provider) throw notFound("Provider profile not found");
  if (provider.verificationStatus === "VERIFIED") throw conflict("This practice is already verified");
  if (provider.verificationStatus === "PENDING" && provider.verificationSubmittedAt) {
    throw conflict("Your documents are already with the review team");
  }

  await prisma.$transaction([
    prisma.verificationDocument.deleteMany({ where: { providerId: provider.id } }),
    prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        verificationStatus: "PENDING",
        verificationSubmittedAt: new Date(),
        verificationReviewedAt: null,
        verificationNote: input.note ?? null,
      },
    }),
    prisma.verificationDocument.createMany({
      data: input.documents.map((document) => ({
        providerId: provider.id,
        name: document.name,
        url: document.url,
        publicId: document.publicId ?? null,
        fileType: document.fileType ?? null,
        status: "PENDING",
      })),
    }),
  ]);

  await emailVerificationReceived(provider);
  return getMyProvider(userId);
};

export const getProviderStats = async (userId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      profileViews: true,
      verificationStatus: true,
      published: true,
      demoVideoUrl: true,
      firm: true,
      bio: true,
      city: true,
      state: true,
      headline: true,
      portraitUrl: true,
      registrationNumber: true,
    },
  });
  if (!provider) throw notFound("Provider profile not found");

  const [totalProjects, publishedProjects, draftProjects, leads] = await prisma.$transaction([
    prisma.project.count({ where: { providerId: provider.id } }),
    prisma.project.count({ where: { providerId: provider.id, status: "PUBLISHED", adminHidden: false } }),
    prisma.project.count({ where: { providerId: provider.id, status: "DRAFT" } }),
    prisma.demoRequest.groupBy({
      by: ["status"],
      where: { providerId: provider.id },
      _count: { _all: true },
    }),
  ]);

  const leadCounts = Object.fromEntries(leads.map((row) => [row.status, row._count._all]));
  const fields = [
    provider.firm,
    provider.bio,
    provider.headline,
    provider.city,
    provider.state,
    provider.portraitUrl,
    provider.registrationNumber,
  ];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  return {
    profileViews: provider.profileViews,
    verificationStatus: provider.verificationStatus,
    published: provider.published,
    demoAvailable: Boolean(provider.demoVideoUrl),
    profileCompletion: completion,
    projects: {
      total: totalProjects,
      published: publishedProjects,
      drafts: draftProjects,
    },
    leads: {
      total: Object.values(leadCounts).reduce((sum, value) => sum + value, 0),
      pending: leadCounts.REQUESTED ?? 0,
      accepted: leadCounts.ACCEPTED ?? 0,
      declined: leadCounts.DECLINED ?? 0,
      completed: leadCounts.COMPLETED ?? 0,
      cancelled: leadCounts.CANCELLED ?? 0,
    },
  };
};

export const providerSlugFromFirm = (firm) => slugify(firm);
export const providerFeeLabel = (tier) => FEE_TIER_LABELS[tier] ?? tier;
