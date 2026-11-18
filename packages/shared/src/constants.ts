import { z } from "zod";

export const ROLES = ["USER", "PROVIDER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ACCOUNT_STATUSES = ["ACTIVE", "SUSPENDED"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const VERIFICATION_STATUSES = ["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const PROJECT_STATUSES = ["DRAFT", "PUBLISHED", "HIDDEN"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_IMAGE_KINDS = ["PHOTO", "PLATE"] as const;
export type ProjectImageKind = (typeof PROJECT_IMAGE_KINDS)[number];

export const REQUEST_STATUSES = ["REQUESTED", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const BUDGET_RANGES = [
  "UNDER_5M",
  "5M_20M",
  "20M_50M",
  "50M_250M",
  "ABOVE_250M",
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const BUDGET_LABELS: Record<BudgetRange, string> = {
  UNDER_5M: "Under ₦5m",
  "5M_20M": "₦5m – ₦20m",
  "20M_50M": "₦20m – ₦50m",
  "50M_250M": "₦50m – ₦250m",
  ABOVE_250M: "₦250m+",
};

export const FEE_TIERS = ["TIER_50M", "TIER_80M", "TIER_100M", "TIER_150M", "TIER_250M", "TIER_300M"] as const;
export type FeeTier = (typeof FEE_TIERS)[number];

export const FEE_TIER_LABELS: Record<FeeTier, string> = {
  TIER_50M: "₦50m+",
  TIER_80M: "₦80m+",
  TIER_100M: "₦100m+",
  TIER_150M: "₦150m+",
  TIER_250M: "₦250m+",
  TIER_300M: "₦300m+",
};

export const PROJECT_TYPES = [
  "Private Residence",
  "Coastal Residence",
  "Civic / Institutional",
  "Commercial",
  "Institutional",
  "Cultural",
  "Hospitality",
  "Healthcare",
  "Interiors",
  "Adaptive Reuse",
  "Public Realm",
  "Other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Abuja FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;
export type NigerianState = (typeof NIGERIAN_STATES)[number];

export const SPECIALTY_NAMES = [
  "Tropical Modernism",
  "Rammed Earth",
  "Coastal Residential",
  "Civic Architecture",
  "Concrete Brutalism",
  "Institutional",
  "Timber Structures",
  "Hospitality",
  "Earth Architecture",
  "Cultural",
  "Adaptive Reuse",
  "Healthcare",
  "Public Realm",
  "Interiors",
  "Small Residential",
  "Furniture",
] as const;
export type SpecialtyName = (typeof SPECIALTY_NAMES)[number];

export const SORT_OPTIONS = ["recommended", "experience", "projects", "name"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const LEAD_STATUSES = ["REQUESTED", "ACCEPTED", "DECLINED", "CANCELLED", "COMPLETED"] as const;

export const VERIFICATION_SLA_HOURS = 48;
export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;
export const PAGE_SIZE_DEFAULT = 12;
export const PAGE_SIZE_MAX = 50;

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const roleSchema = z.enum(ROLES);
export const accountStatusSchema = z.enum(ACCOUNT_STATUSES);
export const verificationStatusSchema = z.enum(VERIFICATION_STATUSES);
export const projectStatusSchema = z.enum(PROJECT_STATUSES);
export const projectImageKindSchema = z.enum(PROJECT_IMAGE_KINDS);
export const requestStatusSchema = z.enum(REQUEST_STATUSES);
export const budgetRangeSchema = z.enum(BUDGET_RANGES);
export const feeTierSchema = z.enum(FEE_TIERS);
export const projectTypeSchema = z.enum(PROJECT_TYPES);
export const specialtyNameSchema = z.enum(SPECIALTY_NAMES);
export const sortOptionSchema = z.enum(SORT_OPTIONS);
