import { created, ok } from "../../utils/http.js";
import * as specialtyService from "./specialty.service.js";

export const list = async (_req, res) => {
  const specialties = await specialtyService.listSpecialties();
  return ok(
    res,
    specialties.map((specialty) => ({
      id: specialty.id,
      name: specialty.name,
      slug: specialty.slug,
      count: specialty._count.providers,
    })),
  );
};

export const create = async (req, res) => {
  const specialty = await specialtyService.createSpecialty(req.body);
  return created(res, {
    id: specialty.id,
    name: specialty.name,
    slug: specialty.slug,
    count: 0,
  });
};
