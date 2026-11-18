import { prisma } from "../../config/prisma.js";
import { slugify } from "../../utils/strings.js";

export const listSpecialties = () =>
  prisma.specialty.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          providers: { where: { published: true, verificationStatus: "VERIFIED" } },
        },
      },
    },
  });

export const createSpecialty = async (input) => {
  const name = input.name;
  return prisma.specialty.create({
    data: {
      name,
      slug: input.slug || slugify(name),
    },
  });
};
