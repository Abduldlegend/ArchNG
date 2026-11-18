import { z } from "zod";
import {
  BUDGET_RANGES,
  FEE_TIERS,
  MAX_UPLOAD_BYTES,
  NIGERIAN_STATES,
  PAGE_SIZE_DEFAULT,
  PAGE_SIZE_MAX,
  PROJECT_IMAGE_KINDS,
  PROJECT_STATUSES,
  PROJECT_TYPES,
  REQUEST_STATUSES,
  ROLES,
  SORT_OPTIONS,
  SPECIALTY_NAMES,
  UUID_RE,
  VERIFICATION_STATUSES,
  ALLOWED_DOCUMENT_TYPES,
  ALLOWED_IMAGE_TYPES,
} from "./constants.js";

export const uuidSchema = z.string().regex(UUID_RE, "Expected a UUID");
export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(128);
export const nameSchema = z.string().trim().min(2, "Name is too short").max(120);
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens");

export const optionalUrlSchema = z.union([z.string().trim().url("Enter a valid URL"), z.literal("")]).optional();

export const demoVideoUrlSchema = z
  .string()
  .trim()
  .url("Enter a valid video URL")
  .refine((value) => {
    const authority = value.replace(/^https?:\/\//i, "").split("/")[0] ?? "";
    const host = (authority.split("@").pop()?.split(":")[0] ?? "").toLowerCase();
    return (
      host === "youtu.be" ||
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "vimeo.com" ||
      host.endsWith(".vimeo.com")
    );
  }, "Use a YouTube or Vimeo link");

export const demoVideoUpdateSchema = z.object({
  url: z.union([demoVideoUrlSchema, z.literal("")]),
});
export const optionalTextSchema = z.string().trim().max(4000).optional();

const booleanQuerySchema = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE_DEFAULT),
});

export const idParamSchema = z.object({ id: uuidSchema });
export const idOrSlugParamSchema = z.object({ idOrSlug: z.string().trim().min(1).max(160) });
export const providerIdParamSchema = z.object({ providerId: uuidSchema });

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["USER", "PROVIDER"]).default("USER"),
  firm: z.string().trim().min(2).max(160).optional(),
  city: z.string().trim().min(2).max(120).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(128),
});

export const authUserSelectSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  status: z.string(),
  hasProviderProfile: z.boolean().optional(),
});

export const providerListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  specialty: z.enum(SPECIALTY_NAMES).optional(),
  feeTier: z.enum(FEE_TIERS).optional(),
  minYears: z.coerce.number().int().min(0).max(80).optional(),
  maxYears: z.coerce.number().int().min(0).max(80).optional(),
  demo: booleanQuerySchema,
  sort: z.enum(SORT_OPTIONS).default("recommended"),
});

export const experienceInputSchema = z.object({
  id: uuidSchema.optional(),
  title: z.string().trim().min(2).max(160),
  organisation: z.string().trim().min(2).max(160),
  year: z.coerce.number().int().min(1950).max(2100),
  description: z.string().trim().max(1000).optional().default(""),
  order: z.coerce.number().int().min(0).max(100).optional().default(0),
});

export const providerProfileUpdateSchema = z.object({
  firm: z.string().trim().min(2).max(160).optional(),
  headline: z.string().trim().max(180).optional(),
  bio: z.string().trim().max(4000).optional(),
  city: z.string().trim().min(2).max(120).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional(),
  feeTier: z.enum(FEE_TIERS).optional(),
  portraitUrl: optionalUrlSchema,
  coverUrl: optionalUrlSchema,
  contactEmail: z.union([emailSchema, z.literal("")]).optional(),
  contactPhone: z.string().trim().max(40).optional(),
  whatsapp: z.string().trim().max(40).optional(),
  website: optionalUrlSchema,
  showEmailToAccepted: z.boolean().optional(),
  showPhoneToAccepted: z.boolean().optional(),
  publishResponseWindow: z.boolean().optional(),
  demoVideoUrl: z.union([demoVideoUrlSchema, z.literal("")]).optional(),
  registrationNumber: z.string().trim().max(80).optional(),
  licenceExpiresAt: z.coerce.date().optional(),
  acceptingLeads: z.boolean().optional(),
  published: z.boolean().optional(),
  specialties: z.array(z.enum(SPECIALTY_NAMES)).max(12).optional(),
  experiences: z.array(experienceInputSchema).max(20).optional(),
});

export const projectImageInputSchema = z.object({
  id: uuidSchema.optional(),
  url: z.string().trim().url("Enter a valid image URL"),
  publicId: z.string().trim().max(300).optional(),
  kind: z.enum(PROJECT_IMAGE_KINDS).default("PHOTO"),
  alt: z.string().trim().max(300).optional(),
  isCover: z.boolean().optional().default(false),
  order: z.coerce.number().int().min(0).max(100).optional().default(0),
  plateLabel: z.string().trim().max(80).optional(),
  plateTitle: z.string().trim().max(160).optional(),
  plateYear: z.string().trim().max(10).optional(),
  plateScale: z.string().trim().max(40).optional(),
});

export const projectCreateSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug: slugSchema.optional(),
  typology: z.enum(PROJECT_TYPES),
  city: z.string().trim().min(2).max(120),
  state: z.enum(NIGERIAN_STATES),
  year: z.coerce.number().int().min(1900).max(2100),
  gfa: z.string().trim().min(1).max(60),
  budget: z.coerce.number().finite().min(0).max(999_999_999_999),
  structural: z.string().trim().max(300).optional().default(""),
  climate: z.string().trim().max(300).optional().default(""),
  summary: z.string().trim().min(20, "Add a longer project summary").max(4000),
  status: z.enum(PROJECT_STATUSES).default("DRAFT"),
  images: z.array(projectImageInputSchema).max(30).optional().default([]),
});

export const projectUpdateSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  slug: slugSchema.optional(),
  typology: z.enum(PROJECT_TYPES).optional(),
  city: z.string().trim().min(2).max(120).optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  gfa: z.string().trim().min(1).max(60).optional(),
  budget: z.coerce.number().finite().min(0).max(999_999_999_999).optional(),
  structural: z.string().trim().max(300).optional(),
  climate: z.string().trim().max(300).optional(),
  summary: z.string().trim().min(20).max(4000).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  images: z.array(projectImageInputSchema).max(30).optional(),
});

export const projectListQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  provider: slugSchema.optional(),
  state: z.enum(NIGERIAN_STATES).optional(),
  typology: z.enum(PROJECT_TYPES).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  sort: z.enum(["recent", "year", "budget"]).default("recent"),
});

export const myProjectQuerySchema = paginationSchema.extend({
  status: z.enum(PROJECT_STATUSES).optional(),
});

export const demoRequestCreateSchema = z
  .object({
    providerId: uuidSchema.optional(),
    providerSlug: slugSchema.optional(),
    projectType: z.enum(PROJECT_TYPES),
    state: z.enum(NIGERIAN_STATES),
    location: z.string().trim().max(160).optional(),
    budgetRange: z.enum(BUDGET_RANGES),
    brief: z.string().trim().min(30, "Tell the practice a little more").max(4000),
  })
  .refine((value) => Boolean(value.providerId || value.providerSlug), {
    message: "A provider is required",
    path: ["providerId"],
  });

export const requestStatusUpdateSchema = z.object({
  status: z.enum(REQUEST_STATUSES),
  note: z.string().trim().max(1000).optional(),
});

export const requestListQuerySchema = paginationSchema.extend({
  status: z.enum(REQUEST_STATUSES).optional(),
});

export const providerLeadQuerySchema = paginationSchema.extend({
  status: z.enum(REQUEST_STATUSES).optional(),
});

export const favoriteCreateSchema = z.object({
  providerId: uuidSchema,
});

export const verificationDecisionSchema = z.object({
  status: z.enum(["VERIFIED", "REJECTED"]),
  note: z.string().trim().max(1000).optional(),
});

export const verificationSubmitSchema = z.object({
  note: z.string().trim().max(1000).optional(),
  documents: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(180),
        url: z.string().trim().url(),
        publicId: z.string().trim().max(300).optional(),
        fileType: z.string().trim().max(80).optional(),
      }),
    )
    .min(1, "Upload at least one verification document")
    .max(10),
});

export const verificationListQuerySchema = paginationSchema.extend({
  status: z.enum(VERIFICATION_STATUSES).optional(),
});

export const specialtyCreateSchema = z.object({
  name: z.enum(SPECIALTY_NAMES),
  slug: slugSchema.optional(),
});

export const adminUserQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  verification: z.enum(VERIFICATION_STATUSES).optional(),
});

export const adminUserStatusSchema = z.object({
  status: z.enum(["ACTIVE", "SUSPENDED"]),
});

export const adminProjectQuerySchema = paginationSchema.extend({
  q: z.string().trim().max(120).optional(),
  status: z.enum(PROJECT_STATUSES).optional(),
  hidden: booleanQuerySchema,
});

export const adminProjectVisibilitySchema = z.object({
  adminHidden: z.boolean(),
});

export const uploadSignSchema = z.object({
  folder: z.enum(["avatars", "covers", "projects", "plates", "documents", "videos"]),
  fileName: z.string().trim().min(1).max(180),
  contentType: z.string().trim().min(1).max(120),
  size: z.coerce.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

export const uploadFolders = {
  avatars: { types: ALLOWED_IMAGE_TYPES, maxBytes: 10 * 1024 * 1024 },
  covers: { types: ALLOWED_IMAGE_TYPES, maxBytes: 15 * 1024 * 1024 },
  projects: { types: ALLOWED_IMAGE_TYPES, maxBytes: 20 * 1024 * 1024 },
  plates: { types: ALLOWED_IMAGE_TYPES, maxBytes: 20 * 1024 * 1024 },
  documents: { types: ALLOWED_DOCUMENT_TYPES, maxBytes: 20 * 1024 * 1024 },
  videos: { types: ["video/mp4", "video/webm", "video/quicktime"], maxBytes: MAX_UPLOAD_BYTES },
} as const;

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProviderProfileUpdateInput = z.infer<typeof providerProfileUpdateSchema>;
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type DemoRequestCreateInput = z.infer<typeof demoRequestCreateSchema>;
export type UploadSignInput = z.infer<typeof uploadSignSchema>;
