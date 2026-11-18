import { buildMeta, created, noContent, ok } from "../../utils/http.js";
import * as favoriteService from "./favorite.service.js";

export const list = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, favorites } = await favoriteService.listFavorites(req.user.id, filters);
  return ok(
    res,
    favorites,
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total }),
  );
};

export const add = async (req, res) => {
  const favorite = await favoriteService.addFavorite(req.user.id, req.body.providerId);
  return created(res, favorite);
};

export const remove = async (req, res) => {
  await favoriteService.removeFavorite(req.user.id, req.params.providerId);
  return noContent(res);
};
