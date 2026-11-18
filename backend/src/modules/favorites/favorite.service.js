import { prisma } from "../../config/prisma.js";
import { providerCardInclude } from "../../config/includes.js";
import { notFound } from "../../utils/errors.js";
import { serializeProviderCard } from "../../serializers/index.js";

export const listFavorites = async (userId, filters) => {
  const { page, pageSize } = filters;
  const where = { userId };
  const [total, favorites] = await prisma.$transaction([
    prisma.favorite.count({ where }),
    prisma.favorite.findMany({
      where,
      include: { provider: { include: providerCardInclude } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return {
    total,
    favorites: favorites.map((favorite) => ({
      id: favorite.id,
      createdAt: favorite.createdAt,
      provider: serializeProviderCard(favorite.provider),
    })),
  };
};

export const addFavorite = async (userId, providerId) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: providerId },
    include: providerCardInclude,
  });
  if (!provider || !provider.published || provider.verificationStatus !== "VERIFIED") {
    throw notFound("Practice not found");
  }

  const favorite = await prisma.favorite.upsert({
    where: { userId_providerId: { userId, providerId } },
    update: {},
    create: { userId, providerId },
  });
  return {
    id: favorite.id,
    createdAt: favorite.createdAt,
    provider: serializeProviderCard(provider),
  };
};

export const removeFavorite = async (userId, providerId) => {
  await prisma.favorite.deleteMany({ where: { userId, providerId } });
};
