import { serializeProviderCard } from "../../serializers/index.js";
import { buildMeta, ok } from "../../utils/http.js";
import * as providerService from "./provider.service.js";

export const list = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, providers } = await providerService.listProviders(filters);
  return ok(
    res,
    providers.map(serializeProviderCard),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total }),
  );
};

export const get = async (req, res) => {
  const result = await providerService.getProvider(req.params.idOrSlug, req.user);
  return ok(res, result.provider, { access: result.access });
};

export const getGated = async (req, res) => {
  const result = await providerService.getGatedProvider(req.params.idOrSlug, req.user);
  return ok(res, result.provider, { access: result.access });
};

export const getMine = async (req, res) => {
  const profile = await providerService.getMyProvider(req.user.id);
  return ok(res, profile);
};

export const updateMine = async (req, res) => {
  const profile = await providerService.updateMyProvider(req.user.id, req.body);
  return ok(res, profile);
};

export const submitVerification = async (req, res) => {
  const profile = await providerService.submitVerification(req.user.id, req.body);
  return ok(res, profile, { message: "Verification documents submitted" });
};

export const setDemoVideo = async (req, res) => {
  const profile = await providerService.setDemoVideo(req.user.id, req.body.url);
  return ok(res, profile, { message: req.body.url ? "Demo video saved" : "Demo video removed" });
};

export const stats = async (req, res) => {
  const result = await providerService.getProviderStats(req.user.id);
  return ok(res, result);
};
