export const providerCardInclude = {
  user: { select: { id: true, name: true, email: true, status: true } },
  specialties: { orderBy: { name: "asc" } },
  _count: { select: { projects: true, favorites: true, demoRequests: true } },
};

export const providerProfileInclude = {
  user: { select: { id: true, name: true, email: true, status: true } },
  specialties: { orderBy: { name: "asc" } },
  experiences: { orderBy: [{ order: "asc" }, { year: "desc" }] },
  verificationDocuments: { orderBy: { uploadedAt: "desc" } },
  _count: { select: { projects: true, favorites: true, demoRequests: true } },
};

export const projectSummaryInclude = {
  provider: {
    select: {
      id: true,
      slug: true,
      firm: true,
      portraitUrl: true,
      verificationStatus: true,
      published: true,
      user: { select: { name: true, email: true, status: true } },
    },
  },
  coverImage: true,
  images: { where: { kind: "PHOTO" }, orderBy: { order: "asc" } },
};

export const projectDetailInclude = {
  provider: {
    select: {
      id: true,
      slug: true,
      firm: true,
      portraitUrl: true,
      verificationStatus: true,
      published: true,
      user: { select: { name: true, email: true, status: true } },
    },
  },
  coverImage: true,
  images: { orderBy: { order: "asc" } },
};

export const requestClientInclude = {
  user: { select: { id: true, name: true, email: true, status: true } },
  provider: {
    select: {
      id: true,
      slug: true,
      firm: true,
      portraitUrl: true,
      verificationStatus: true,
      publishResponseWindow: true,
      contactEmail: true,
      contactPhone: true,
      whatsapp: true,
      website: true,
      showEmailToAccepted: true,
      showPhoneToAccepted: true,
      demoVideoUrl: true,
      demoVideoSource: true,
      registrationNumber: true,
      user: { select: { id: true, name: true, email: true, status: true } },
    },
  },
};

export const providerAdminInclude = {
  user: { select: { id: true, name: true, email: true, status: true } },
  verificationDocuments: { orderBy: { uploadedAt: "desc" } },
};

export const adminUserInclude = {
  provider: {
    select: {
      id: true,
      slug: true,
      firm: true,
      city: true,
      state: true,
      verificationStatus: true,
      published: true,
    },
  },
  _count: { select: { demoRequests: true } },
};

