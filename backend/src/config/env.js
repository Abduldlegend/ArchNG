import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

const here = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(here, "../..");
const envPath = existsSync(resolve(backendRoot, ".env")) ? resolve(backendRoot, ".env") : undefined;

if (envPath) dotenv.config({ path: envPath });

const booleanFromString = z.preprocess((value) => {
  if (typeof value === "string") return value.toLowerCase() === "true";
  return value;
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  COOKIE_SECURE: booleanFromString.default(false),
  EMAIL_DRIVER: z.enum(["console", "smtp"]).default("console"),
  EMAIL_FROM: z.string().default("ArchNG <no-reply@archng.local>"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  STORAGE_DRIVER: z.enum(["local", "cloudinary"]).default("local"),
  UPLOAD_DIR: z.string().default("uploads"),
  PUBLIC_API_URL: z.string().url().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_FOLDER: z.string().default("archng"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@archng.test"),
  SEED_ADMIN_PASSWORD: z.string().default("Password123!"),
  SEED_DEMO_PASSWORD: z.string().default("Password123!"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
  throw new Error(`Invalid environment configuration:\n${messages.join("\n")}`);
}

const raw = parsed.data;
const publicApiUrl = raw.PUBLIC_API_URL || `http://localhost:${raw.PORT}`;

if (raw.NODE_ENV === "production") {
  const insecure = [
    ["JWT_ACCESS_SECRET", raw.JWT_ACCESS_SECRET],
    ["JWT_REFRESH_SECRET", raw.JWT_REFRESH_SECRET],
  ].filter(([, value]) => /change-before-production|replace-with/i.test(value));
  if (insecure.length > 0) {
    throw new Error(`Refusing to start in production with placeholder secrets: ${insecure.map(([key]) => key).join(", ")}`);
  }
  if (raw.STORAGE_DRIVER === "cloudinary") {
    if (!raw.CLOUDINARY_CLOUD_NAME || !raw.CLOUDINARY_API_KEY || !raw.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary storage requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET");
    }
  }
}

export const env = Object.freeze({
  ...raw,
  PUBLIC_API_URL: publicApiUrl,
  CORS_ORIGINS: raw.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  IS_TEST: raw.NODE_ENV === "test",
  IS_PRODUCTION: raw.NODE_ENV === "production",
});
