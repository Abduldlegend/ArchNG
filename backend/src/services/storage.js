import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { AppError, badRequest, unprocessable } from "../utils/errors.js";
import { safeFileName } from "../utils/strings.js";
import { uploadFolders } from "@archng/shared";

const here = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(here, "../..");
export const uploadRoot = resolve(backendRoot, env.UPLOAD_DIR);

export const ensureUploadRoot = async () => {
  await mkdir(uploadRoot, { recursive: true });
};

const assertUpload = ({ folder, contentType, size }) => {
  const rule = uploadFolders[folder];
  if (!rule) throw badRequest("Unknown upload folder");
  if (!rule.types.includes(contentType)) {
    throw unprocessable(`Unsupported file type for ${folder}`, {
      allowed: rule.types,
    });
  }
  if (size > rule.maxBytes) {
    throw unprocessable("That file is too large", { maxBytes: rule.maxBytes });
  }
};

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

const signedLocalToken = (payload) =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
    audience: "archng-upload",
    issuer: "archng",
  });

export const signUpload = async ({ folder, fileName, contentType, size }) => {
  assertUpload({ folder, contentType, size });

  if (env.STORAGE_DRIVER === "cloudinary") {
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
      throw new AppError(503, "STORAGE_NOT_CONFIGURED", "Cloudinary storage is not configured");
    }
    configureCloudinary();
    const timestamp = Math.floor(Date.now() / 1000);
    const targetFolder = `${env.CLOUDINARY_FOLDER}/${folder}`;
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder: targetFolder }, env.CLOUDINARY_API_SECRET);
    return {
      provider: "cloudinary",
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
      method: "POST",
      fields: {
        api_key: env.CLOUDINARY_API_KEY,
        timestamp,
        folder: targetFolder,
        signature,
      },
      publicIdHint: `${targetFolder}/`,
      maxBytes: uploadFolders[folder].maxBytes,
    };
  }

  const token = signedLocalToken({
    type: "upload",
    folder,
    fileName: safeFileName(fileName),
    contentType,
    size,
  });
  return {
    provider: "local",
    uploadUrl: `${env.PUBLIC_API_URL}/api/v1/uploads/local/${token}`,
    method: "PUT",
    headers: { "Content-Type": contentType },
    publicUrl: null,
    maxBytes: uploadFolders[folder].maxBytes,
  };
};

export const writeLocalUpload = async ({ token, buffer, contentType }) => {
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      audience: "archng-upload",
      issuer: "archng",
    });
  } catch {
    throw new AppError(401, "UPLOAD_TOKEN_INVALID", "This upload link has expired");
  }

  if (payload.type !== "upload") throw badRequest("Invalid upload token");
  assertUpload(payload);

  if (!Buffer.isBuffer(buffer) || buffer.length === 0) throw badRequest("No file was uploaded");
  if (buffer.length > payload.size) throw unprocessable("The uploaded file is larger than declared");
  if (contentType && contentType !== payload.contentType) {
    throw unprocessable("The uploaded file type does not match the signed type");
  }

  const extension = extname(payload.fileName);
  const baseName = payload.fileName.slice(0, payload.fileName.length - extension.length) || "upload";
  const storedName = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeFileName(baseName)}${extension}`;
  const directory = resolve(uploadRoot, payload.folder);
  if (!directory.startsWith(uploadRoot)) throw badRequest("Invalid upload destination");
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, storedName), buffer);

  const publicId = `${payload.folder}/${storedName}`;
  return {
    url: `${env.PUBLIC_API_URL}/uploads/${publicId}`,
    publicId,
    fileName: storedName,
    size: buffer.length,
    contentType: payload.contentType,
  };
};

export const getStorageInfo = () => ({
  driver: env.STORAGE_DRIVER,
  local: env.STORAGE_DRIVER === "local" ? `${env.PUBLIC_API_URL}/uploads` : null,
});
