import { serializeLead, serializeRequest } from "../../serializers/index.js";
import { buildMeta, created, ok } from "../../utils/http.js";
import * as requestService from "./request.service.js";

export const create = async (req, res) => {
  const result = await requestService.createRequest(req.user.id, req.body);
  return created(res, result);
};

export const listMine = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, requests, counts } = await requestService.listMyRequests(req.user.id, filters);
  return ok(
    res,
    requests.map((request) => serializeRequest(request)),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total, counts }),
  );
};

export const getMine = async (req, res) => {
  const request = await requestService.getMyRequest(req.user.id, req.params.id);
  return ok(res, request);
};

export const cancelMine = async (req, res) => {
  const request = await requestService.cancelMyRequest(req.user.id, req.params.id);
  return ok(res, request);
};

export const listLeads = async (req, res) => {
  const filters = req.validatedQuery;
  const { total, requests, counts } = await requestService.listLeads(req.user.id, filters);
  return ok(
    res,
    requests.map((request) => serializeLead(request)),
    buildMeta({ page: filters.page, pageSize: filters.pageSize, total, counts }),
  );
};

export const getLead = async (req, res) => {
  const lead = await requestService.getLead(req.user.id, req.params.id);
  return ok(res, lead);
};

export const updateLead = async (req, res) => {
  const lead = await requestService.updateLead(req.user.id, req.params.id, req.body);
  return ok(res, lead);
};
