export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

export const ok = (res, data, meta) => {
  const body = meta ? { data, meta } : { data };
  return res.status(200).json(body);
};

export const created = (res, data, meta) => {
  const body = meta ? { data, meta } : { data };
  return res.status(201).json(body);
};

export const noContent = (res) => res.status(204).end();

export const buildMeta = ({ page, pageSize, total, counts }) => ({
  page,
  pageSize,
  total,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
  ...(counts ? { counts } : {}),
});
