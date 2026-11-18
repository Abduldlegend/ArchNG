import { UUID_RE } from "@archng/shared";
import { prisma } from "../../config/prisma.js";
import { projectDetailInclude, projectSummaryInclude } from "../../config/includes.js";
import { conflict, forbidden, notFound, unprocessable } from "../../utils/errors.js";
import { uniqueSlug } from "../../utils/strings.js";
import { serializeProjectDetail } from "../../serializers/index.js";

const slugExists = async (slug) =>
  Boolean(await prisma.project.findUnique({ where: { slug }, select: { id: true } }));

export const listProjects = async (filters) => {
  const { page, pageSize, q, provider, state, typology, year, sort } = filters;
  const where = {
    status: "PUBLISHED",
    adminHidden: false,
    provider: {
      published: true,
      verificationStatus: "VERIFIED",
      user: { status: "ACTIVE" },
      ...(provider ? { slug: provider } : {}),
    },
    ...(state ? { state } : {}),
    ...(typology ? { typology } : {}),
    ...(year ? { year } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { state: { contains: q, mode: "insensitive" } },
            { typology: { contains: q, mode: "insensitive" } },
            { provider: { firm: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "year"
      ? [{ year: "desc" }, { createdAt: "desc" }]
      : sort === "budget"
        ? [{ budget: "desc" }, { year: "desc" }]
        : [{ createdAt: "desc" }];

  const [total, projects] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectSummaryInclude,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { total, projects };
};

const findProject = async (idOrSlug) => {
  const where = UUID_RE.test(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
  return prisma.project.findUnique({
    where,
    include: projectDetailInclude,
  });
};

export const getProject = async (idOrSlug, viewer) => {
  const project = await findProject(idOrSlug);
  if (!project) throw notFound("Project not found");

  const isOwner = Boolean(viewer?.provider?.id && viewer.provider.id === project.providerId);
  const isAdmin = viewer?.role === "ADMIN";
  const providerIsPublic =
    project.provider?.published &&
    project.provider.verificationStatus === "VERIFIED" &&
    project.provider.user?.status === "ACTIVE";
  if (!isOwner && !isAdmin && (!providerIsPublic || project.status !== "PUBLISHED" || project.adminHidden)) {
    throw notFound("Project not found");
  }

  return {
    project: serializeProjectDetail(project),
    access: isAdmin ? "admin" : isOwner ? "manage" : "public",
  };
};

const imageData = (image, index) => ({
  url: image.url,
  publicId: image.publicId ?? null,
  kind: image.kind,
  alt: image.alt ?? null,
  isCover: image.isCover ?? false,
  order: image.order ?? index,
  plateLabel: image.plateLabel ?? null,
  plateTitle: image.plateTitle ?? null,
  plateYear: image.plateYear ?? null,
  plateScale: image.plateScale ?? null,
});

const chooseCover = (images) => {
  if (!images || images.length === 0) return null;
  const explicit = images.find((image) => image.isCover);
  if (explicit) return explicit;
  const photo = images.find((image) => image.kind === "PHOTO");
  return photo || images[0];
};

export const createProject = async (userId, input) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw notFound("Provider profile not found");
  if (input.status === "PUBLISHED" && provider.verificationStatus !== "VERIFIED") {
    throw forbidden("Your practice must be verified before a project can be published");
  }
  if (input.status === "PUBLISHED" && (!input.images || input.images.length === 0)) {
    throw unprocessable("Add at least one image before publishing");
  }

  let slug = input.slug;
  if (slug) {
    if (await slugExists(slug)) throw conflict("That project slug is already in use");
  } else {
    slug = await uniqueSlug(input.title, slugExists);
  }

  const images = (input.images ?? []).map(imageData);
  const cover = chooseCover(images);
  if (cover) cover.isCover = true;

  const project = await prisma.project.create({
    data: {
      providerId: provider.id,
      title: input.title,
      slug,
      typology: input.typology,
      city: input.city,
      state: input.state,
      year: input.year,
      gfa: input.gfa,
      budget: input.budget,
      structural: input.structural,
      climate: input.climate,
      summary: input.summary,
      status: input.status,
      images: { create: images },
    },
    include: { images: true },
  });

  const selectedCover = project.images.find((image) => image.isCover) ?? null;
  if (selectedCover) {
    await prisma.project.update({ where: { id: project.id }, data: { coverImageId: selectedCover.id } });
  }

  return getMyProject(userId, project.id);
};

export const getMyProjects = async (userId, filters) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId }, select: { id: true } });
  if (!provider) throw notFound("Provider profile not found");
  const { page, pageSize, status } = filters;
  const where = { providerId: provider.id, ...(status ? { status } : {}) };

  const [total, projects, groups] = await prisma.$transaction([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: projectSummaryInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.project.groupBy({
      by: ["status"],
      where: { providerId: provider.id },
      _count: { _all: true },
    }),
  ]);

  const counts = { total: 0, DRAFT: 0, PUBLISHED: 0, HIDDEN: 0 };
  for (const group of groups) {
    counts[group.status] = group._count._all;
    counts.total += group._count._all;
  }

  return { total, projects, counts };
};

export const getMyProject = async (userId, id) => {
  const project = await prisma.project.findFirst({
    where: { id, provider: { userId } },
    include: projectDetailInclude,
  });
  if (!project) throw notFound("Project not found");
  return serializeProjectDetail(project);
};

export const updateMyProject = async (userId, id, input) => {
  const provider = await prisma.providerProfile.findUnique({ where: { userId } });
  if (!provider) throw notFound("Provider profile not found");
  const existing = await prisma.project.findFirst({
    where: { id, providerId: provider.id },
    include: { images: true },
  });
  if (!existing) throw notFound("Project not found");

  if (input.status === "PUBLISHED" && provider.verificationStatus !== "VERIFIED") {
    throw forbidden("Your practice must be verified before a project can be published");
  }
  if (input.slug && input.slug !== existing.slug && (await slugExists(input.slug))) {
    throw conflict("That project slug is already in use");
  }

  const data = {
    title: input.title,
    slug: input.slug,
    typology: input.typology,
    city: input.city,
    state: input.state,
    year: input.year,
    gfa: input.gfa,
    budget: input.budget,
    structural: input.structural,
    climate: input.climate,
    summary: input.summary,
    status: input.status,
  };
  Object.keys(data).forEach((key) => data[key] === undefined && delete data[key]);

  if (input.images !== undefined) {
    const images = input.images.map(imageData);
    const cover = chooseCover(images);
    if (cover) cover.isCover = true;
    if (input.status === "PUBLISHED" && images.length === 0) {
      throw unprocessable("Add at least one image before publishing");
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.update({ where: { id }, data: { ...data, coverImageId: null } });
      await tx.projectImage.deleteMany({ where: { projectId: id } });
      const updated = await tx.project.update({
        where: { id },
        data: { images: { create: images } },
        include: { images: true },
      });
      const selectedCover = updated.images.find((image) => image.isCover) ?? null;
      if (selectedCover) {
        await tx.project.update({ where: { id }, data: { coverImageId: selectedCover.id } });
      }
    });
  } else {
    await prisma.project.update({ where: { id }, data });
  }

  return getMyProject(userId, id);
};

export const deleteMyProject = async (userId, id) => {
  const project = await prisma.project.findFirst({
    where: { id, provider: { userId } },
    select: { id: true },
  });
  if (!project) throw notFound("Project not found");
  await prisma.project.delete({ where: { id } });
};
