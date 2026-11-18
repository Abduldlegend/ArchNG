import { serializeProjectSummary } from "../../serializers/index.js";
import { buildMeta, created, noContent, ok } from "../../utils/http.js";
import * as projectService from "./project.service.js";

export const list = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, projects } = await projectService.listProjects(filters);
  return ok(
    res,
    projects.map(serializeProjectSummary),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total }),
  );
};

export const get = async (req, res) => {
  const result = await projectService.getProject(req.params.idOrSlug, req.user);
  return ok(res, result.project, { access: result.access });
};

export const listMine = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, projects, counts } = await projectService.getMyProjects(req.user.id, filters);
  return ok(
    res,
    projects.map(serializeProjectSummary),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total, counts }),
  );
};

export const getMine = async (req, res) => {
  const project = await projectService.getMyProject(req.user.id, req.params.id);
  return ok(res, project);
};

export const create = async (req, res) => {
  const project = await projectService.createProject(req.user.id, req.body);
  return created(res, project);
};

export const update = async (req, res) => {
  const project = await projectService.updateMyProject(req.user.id, req.params.id, req.body);
  return ok(res, project);
};

export const remove = async (req, res) => {
  await projectService.deleteMyProject(req.user.id, req.params.id);
  return noContent(res);
};
