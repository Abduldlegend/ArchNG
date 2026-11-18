import { createHash, randomUUID } from "node:crypto";

export const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100) || "untitled";

export const uniqueSlug = async (base, exists, maxAttempts = 50) => {
  const root = slugify(base);
  let candidate = root;
  for (let i = 2; i <= maxAttempts; i += 1) {
    if (!(await exists(candidate))) return candidate;
    candidate = `${root}-${i}`;
  }
  return `${root}-${randomUUID().slice(0, 8)}`;
};

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");

export const randomTokenId = () => randomUUID();

export const safeFileName = (value) => {
  const cleaned = String(value)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return cleaned || "upload";
};
