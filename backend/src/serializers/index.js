import { BUDGET_LABELS, FEE_TIER_LABELS } from "@archng/shared";
import { relativeTime, deadlineLabel, hoursUntil } from "../utils/dates.js";

export const REQUEST_STATUS_LABELS = {
  REQUESTED: "Requested",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const LEAD_STATUS_LABELS = {
  REQUESTED: "Pending",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const serializeAuthUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  hasProviderProfile: Boolean(user.provider),
  provider: user.provider
    ? {
        id: user.provider.id,
        slug: user.provider.slug,
        firm: user.provider.firm,
        verificationStatus: user.provider.verificationStatus,
        published: user.provider.published,
      }
    : null,
});

export const serializeProviderCard = (provider) => {
  const companyName = provider.firm;
  return {
    id: provider.id,
    slug: provider.slug,
    name: provider.user?.name ?? companyName,
    firm: companyName,
    city: provider.city,
    state: provider.state,
    years: provider.yearsExperience,
    works: provider.worksCount,
    feeTier: FEE_TIER_LABELS[provider.feeTier] ?? provider.feeTier,
    feeTierCode: provider.feeTier,
    specialties: (provider.specialties ?? []).map((specialty) => specialty.name),
    verified: provider.verificationStatus === "VERIFIED",
    verificationStatus: provider.verificationStatus,
    demoAvailable: Boolean(provider.demoVideoUrl),
    portrait: provider.portraitUrl,
    cover: provider.coverUrl,
    philosophy: provider.headline ?? "",
    bio: provider.bio,
    acceptingLeads: provider.acceptingLeads,
    published: provider.published,
    profileViews: provider.profileViews,
  };
};

const serializeContact = (provider, mode) => {
  if (mode === "public") return null;
  const contact = {
    email: provider.contactEmail ?? provider.user?.email ?? null,
    phone: provider.contactPhone || null,
    whatsapp: provider.whatsapp || null,
    website: provider.website || null,
  };
  if (mode !== "manage") {
    if (!provider.showEmailToAccepted) contact.email = null;
    if (!provider.showPhoneToAccepted) {
      contact.phone = null;
      contact.whatsapp = null;
    }
  }
  return contact;
};

export const serializeProviderProfile = (
  provider,
  { access = "public", projects = [] } = {},
) => {
  const canManage = access === "manage";
  const gated = access !== "public";
  const base = serializeProviderCard(provider);
  return {
    ...base,
    experiences: (provider.experiences ?? []).map((experience) => ({
      id: experience.id,
      title: experience.title,
      organisation: experience.organisation,
      year: experience.year,
      description: experience.description,
      order: experience.order,
    })),
    projects: projects.map((project) => serializeProjectSummary(project)),
    gated,
    canManage,
    contact: serializeContact(provider, access),
    video: {
      available: Boolean(provider.demoVideoUrl),
      url: gated ? provider.demoVideoUrl ?? null : null,
      source: gated ? provider.demoVideoSource ?? null : null,
    },
    registrationNumber: gated ? provider.registrationNumber ?? null : null,
    licenceExpiresAt: canManage ? provider.licenceExpiresAt ?? null : null,
    verification: {
      status: provider.verificationStatus,
      note: canManage ? provider.verificationNote ?? null : null,
      submittedAt: canManage ? provider.verificationSubmittedAt ?? null : null,
      reviewedAt: canManage ? provider.verificationReviewedAt ?? null : null,
      documents: canManage
        ? (provider.verificationDocuments ?? []).map((document) => ({
            id: document.id,
            name: document.name,
            fileType: document.fileType,
            url: document.url,
            status: document.status,
            uploadedAt: document.uploadedAt,
          }))
        : [],
    },
    verificationDocuments: canManage
      ? (provider.verificationDocuments ?? []).map((document) => ({
          id: document.id,
          name: document.name,
          fileType: document.fileType,
          url: document.url,
          status: document.status,
          uploadedAt: document.uploadedAt,
        }))
      : undefined,
    contactPrivacy: {
      showEmailToAccepted: provider.showEmailToAccepted,
      showPhoneToAccepted: provider.showPhoneToAccepted,
      publishResponseWindow: provider.publishResponseWindow,
    },
    _count: provider._count,
  };
};

export const serializeProjectSummary = (project) => {
  const photos = (project.images ?? []).filter((image) => image.kind === "PHOTO");
  const cover =
    project.coverImage?.url ??
    photos.find((image) => image.isCover)?.url ??
    photos[0]?.url ??
    null;
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    architectSlug: project.provider?.slug ?? null,
    architectName: project.provider?.user?.name ?? project.provider?.firm ?? null,
    architectFirm: project.provider?.firm ?? null,
    city: project.city,
    state: project.state,
    year: String(project.year),
    typology: project.typology,
    gfa: project.gfa,
    budget: Number(project.budget),
    structural: project.structural,
    climate: project.climate,
    cover,
    summary: project.summary,
    status: project.status,
    adminHidden: project.adminHidden,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

export const serializeProjectDetail = (project) => {
  const summary = serializeProjectSummary(project);
  const images = project.images ?? [];
  const photos = images.filter((image) => image.kind === "PHOTO");
  const plates = images.filter((image) => image.kind === "PLATE");
  return {
    ...summary,
    provider: project.provider
      ? {
          id: project.provider.id,
          slug: project.provider.slug,
          name: project.provider.user?.name ?? project.provider.firm,
          firm: project.provider.firm,
          verified: project.provider.verificationStatus === "VERIFIED",
          portrait: project.provider.portraitUrl,
        }
      : null,
    gallery: photos.filter((image) => image.id !== project.coverImageId).map((image) => image.url),
    plates: plates.map((plate, index) => ({
      id: plate.id,
      label: plate.plateLabel ?? `Plate ${String(index + 1).padStart(2, "0")}`,
      title: plate.plateTitle ?? plate.alt ?? "",
      year: plate.plateYear ?? String(project.year),
      scale: plate.plateScale ?? "",
      url: plate.url,
    })),
    images: images.map((image) => ({
      id: image.id,
      url: image.url,
      publicId: image.publicId,
      kind: image.kind,
      alt: image.alt,
      isCover: image.isCover,
      order: image.order,
      plateLabel: image.plateLabel,
      plateTitle: image.plateTitle,
      plateYear: image.plateYear,
      plateScale: image.plateScale,
    })),
  };
};

const requestDeadline = (request) =>
  new Date(new Date(request.createdAt).getTime() + 48 * 60 * 60 * 1000);

export const serializeRequest = (request, { providerView = false, now = new Date() } = {}) => {
  const deadlineAt = requestDeadline(request);
  const terminal = ["ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"].includes(request.status);
  const providerGated = ["ACCEPTED", "COMPLETED"].includes(request.status) && request.provider;
  const providerContact = providerGated
    ? {
        email: request.provider.showEmailToAccepted ? request.provider.contactEmail ?? request.provider.user?.email ?? null : null,
        phone: request.provider.showPhoneToAccepted ? request.provider.contactPhone ?? null : null,
        whatsapp: request.provider.showPhoneToAccepted ? request.provider.whatsapp ?? null : null,
        website: request.provider.website ?? null,
      }
    : null;
  const data = {
    id: request.id,
    projectType: request.projectType,
    state: request.state,
    location: request.location,
    budgetRange: request.budgetRange,
    budget: BUDGET_LABELS[request.budgetRange] ?? request.budgetRange,
    brief: request.brief,
    status: REQUEST_STATUS_LABELS[request.status] ?? request.status,
    statusCode: request.status,
    note: request.providerNote ?? null,
    videoAccessGranted: Boolean(request.videoAccessGrantedAt),
    videoAccessGrantedAt: request.videoAccessGrantedAt,
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
    architectSlug: request.provider?.slug ?? null,
    architectName: request.provider?.user?.name ?? null,
    architectFirm: request.provider?.firm ?? null,
    provider: request.provider
      ? {
          id: request.provider.id,
          slug: request.provider.slug,
          name: request.provider.user?.name ?? request.provider.firm,
          firm: request.provider.firm,
          portrait: request.provider.portraitUrl,
          verified: request.provider.verificationStatus === "VERIFIED",
        }
      : null,
    client: request.user
      ? {
          id: request.user.id,
          name: request.user.name,
        }
      : null,
    clientName: request.user?.name ?? null,
    providerContact,
    video: {
      available: Boolean(request.provider?.demoVideoUrl),
      url: providerGated ? request.provider.demoVideoUrl ?? null : null,
      source: providerGated ? request.provider.demoVideoSource ?? null : null,
    },
    registrationNumber: providerGated ? request.provider.registrationNumber ?? null : null,
    deadlineAt,
    deadline: terminal ? null : deadlineLabel(deadlineAt, now),
    hoursLeft: terminal ? null : hoursUntil(deadlineAt, now),
    slaBreached: !terminal && hoursUntil(deadlineAt, now) <= 0,
    receivedAt: relativeTime(request.createdAt, now),
    preferenceWindowHours: request.provider?.publishResponseWindow === false ? null : 48,
    contact:
      providerView && ["ACCEPTED", "COMPLETED"].includes(request.status) && request.user
        ? { name: request.user.name, email: request.user.email }
        : null,
  };
  return data;
};

export const serializeLead = (request, { now = new Date() } = {}) => {
  const serialized = serializeRequest(request, { providerView: true, now });
  const deadlineAt = serialized.deadlineAt;
  return {
    id: serialized.id,
    client: serialized.clientName,
    clientName: serialized.clientName,
    clientEmail: serialized.contact?.email ?? null,
    projectType: serialized.projectType,
    city: serialized.location || serialized.state,
    state: serialized.state,
    budget: serialized.budget,
    budgetRange: serialized.budgetRange,
    brief: serialized.brief,
    receivedAt: serialized.receivedAt,
    deadline: serialized.deadline,
    deadlineAt,
    hoursLeft: serialized.hoursLeft,
    slaBreached: serialized.slaBreached,
    status: LEAD_STATUS_LABELS[request.status] ?? request.status,
    statusCode: request.status,
    note: serialized.note,
    createdAt: serialized.createdAt,
    updatedAt: serialized.updatedAt,
  };
};

export const serializeVerificationCase = (provider, now = new Date()) => {
  const deadline = new Date(new Date(provider.verificationSubmittedAt ?? Date.now()).getTime() + 48 * 60 * 60 * 1000);
  const statusMap = {
    PENDING: "Pending",
    VERIFIED: "Verified",
    REJECTED: "Rejected",
    UNVERIFIED: "Unverified",
  };
  return {
    id: provider.id,
    providerId: provider.id,
    name: provider.user?.name ?? provider.firm,
    firm: provider.firm,
    arcon: provider.registrationNumber,
    registrationNumber: provider.registrationNumber,
    city: provider.city,
    state: provider.state,
    submitted: provider.verificationSubmittedAt,
    submittedAt: provider.verificationSubmittedAt,
    sla: provider.verificationStatus === "PENDING" ? deadlineLabel(deadline, now) : statusMap[provider.verificationStatus],
    deadlineAt: deadline,
    status: statusMap[provider.verificationStatus] ?? provider.verificationStatus,
    verificationStatus: provider.verificationStatus,
    email: provider.user?.email ?? null,
    note: provider.verificationNote,
    documents: (provider.verificationDocuments ?? []).map((document) => document.name),
    documentLinks: (provider.verificationDocuments ?? []).map((document) => ({
      id: document.id,
      name: document.name,
      url: document.url,
      status: document.status,
    })),
  };
};

export const serializeAdminUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  provider: user.provider
    ? {
        id: user.provider.id,
        slug: user.provider.slug,
        firm: user.provider.firm,
        city: user.provider.city,
        state: user.provider.state,
        verificationStatus: user.provider.verificationStatus,
        published: user.provider.published,
      }
    : null,
  requests: user._count?.demoRequests ?? undefined,
});
