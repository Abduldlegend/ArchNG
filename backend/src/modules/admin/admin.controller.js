import { buildMeta, ok } from "../../utils/http.js";
import { serializeAdminUser, serializeVerificationCase } from "../../serializers/index.js";
import * as adminService from "./admin.service.js";

export const stats = async (_req, res) => {
  const data = await adminService.getStats();
  return ok(res, data);
};

export const listVerifications = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, providers, counts } = await adminService.listVerifications(filters);
  return ok(
    res,
    providers.map((provider) => serializeVerificationCase(provider)),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total, counts }),
  );
};

export const decideVerification = async (req, res) => {
  const result = await adminService.decideVerification(req.params.providerId, req.body);
  return ok(res, result);
};

export const listUsers = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, users } = await adminService.listUsers(filters);
  return ok(
    res,
    users.map(serializeAdminUser),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total }),
  );
};

export const setUserStatus = async (req, res) => {
  const user = await adminService.setUserStatus(req.user.id, req.params.id, req.body.status);
  return ok(res, user);
};

export const listProjects = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, projects, counts } = await adminService.listProjects(filters);
  return ok(
    res,
    projects.map(adminService.serializeAdminProject),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total, counts }),
  );
};

export const setProjectVisibility = async (req, res) => {
  const project = await adminService.setProjectVisibility(req.params.id, req.body.adminHidden);
  return ok(res, project);
};

export const activity = async (_req, res) => {
  const events = await adminService.getActivity();
  return ok(res, events);
};
