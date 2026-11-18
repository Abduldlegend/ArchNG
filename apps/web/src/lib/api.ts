import {
  IMG,
  type Architect,
  type DemoRequest,
  type Lead,
  type Project,
  type RequestStatus,
  type VerificationCase,
} from "../data";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(/\/$/, "");
const ASSET_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL ?? "http://localhost:4000").replace(/\/$/, "");

type ApiEnvelope<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let accessToken: string | null = null;
let refreshPromise: Promise<SessionPayload | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

export const resolveAssetUrl = (value: string | null | undefined) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value) || value.startsWith("data:")) return value;
  return `${ASSET_BASE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const queryString = (params: Record<string, string | number | boolean | null | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const result = search.toString();
  return result ? `?${result}` : "";
};

const parseError = async (response: Response) => {
  let body: ApiErrorBody | null = null;
  try {
    body = (await response.json()) as ApiErrorBody;
  } catch {
    body = null;
  }
  return new ApiError(
    response.status,
    body?.error?.code ?? `HTTP_${response.status}`,
    body?.error?.message ?? "Something went wrong. Please try again.",
    body?.error?.details,
  );
};

const rawRequest = async <T>(path: string, init: RequestInit = {}): Promise<ApiEnvelope<T>> => {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (accessToken && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) throw await parseError(response);
  if (response.status === 204) return { data: undefined as T };
  return (await response.json()) as ApiEnvelope<T>;
};

const request = async <T>(path: string, init: RequestInit = {}, retry = true): Promise<ApiEnvelope<T>> => {
  try {
    return await rawRequest<T>(path, init);
  } catch (error) {
    if (retry && error instanceof ApiError && error.status === 401 && !path.startsWith("/auth/")) {
      const session = await refreshSession();
      if (session) return rawRequest<T>(path, init);
      window.dispatchEvent(new Event("archng:unauthorized"));
    }
    throw error;
  }
};

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: "USER" | "PROVIDER" | "ADMIN";
  status: string;
  hasProviderProfile: boolean;
  provider: {
    id: string;
    slug: string;
    firm: string;
    verificationStatus: string;
    published: boolean;
  } | null;
}

export interface SessionPayload {
  user: AuthUserDto;
  accessToken: string;
  expiresIn: string;
  tokenType: string;
}

export interface ProviderCardDto {
  id: string;
  slug: string;
  name: string;
  firm: string;
  city: string;
  state: string;
  years: number;
  works: number;
  feeTier: string;
  feeTierCode: string;
  specialties: string[];
  verified: boolean;
  verificationStatus: string;
  demoAvailable: boolean;
  portrait: string | null;
  cover: string | null;
  philosophy: string;
  bio: string;
  acceptingLeads: boolean;
  published: boolean;
  profileViews: number;
}

export interface ContactDto {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
}

export interface ExperienceDto {
  id: string;
  title: string;
  organisation: string;
  year: number;
  description: string;
  order: number;
}

export interface VerificationDocumentDto {
  id: string;
  name: string;
  fileType: string | null;
  url: string;
  status: string;
  uploadedAt: string;
}

export interface ProviderProfileDto extends ProviderCardDto {
  projects: ProjectSummaryDto[];
  gated: boolean;
  canManage: boolean;
  contact: ContactDto | null;
  video: {
    available: boolean;
    url: string | null;
    source: string | null;
  };
  registrationNumber: string | null;
  licenceExpiresAt: string | null;
  verification: {
    status: string;
    note: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    documents: VerificationDocumentDto[];
  };
  verificationDocuments?: VerificationDocumentDto[];
  contactPrivacy: {
    showEmailToAccepted: boolean;
    showPhoneToAccepted: boolean;
    publishResponseWindow: boolean;
  };
  experiences: ExperienceDto[];
}

export interface ProjectSummaryDto {
  id: string;
  slug: string;
  title: string;
  architectSlug: string | null;
  architectName: string | null;
  architectFirm: string | null;
  city: string;
  state: string;
  year: string;
  typology: string;
  gfa: string;
  budget: number;
  structural: string;
  climate: string;
  cover: string | null;
  summary: string;
  status: string;
  adminHidden: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: {
    id: string;
    slug: string;
    name: string;
    firm: string;
    verified: boolean;
    portrait: string | null;
  } | null;
}

export interface ProjectDetailDto extends ProjectSummaryDto {
  provider: {
    id: string;
    slug: string;
    name: string;
    firm: string;
    verified: boolean;
    portrait: string | null;
  } | null;
  gallery: string[];
  plates: Array<{
    id: string;
    label: string;
    title: string;
    year: string;
    scale: string;
    url: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    publicId: string | null;
    kind: string;
    alt: string | null;
    isCover: boolean;
    order: number;
    plateLabel: string | null;
    plateTitle: string | null;
    plateYear: string | null;
    plateScale: string | null;
  }>;
}

export interface RequestDto {
  id: string;
  projectType: string;
  state: string;
  location: string | null;
  budgetRange: string;
  budget: string;
  brief: string;
  status: string;
  statusCode: string;
  note: string | null;
  videoAccessGranted: boolean;
  createdAt: string;
  updatedAt: string;
  architectSlug: string | null;
  architectName: string | null;
  architectFirm: string | null;
  provider: {
    id: string;
    slug: string;
    name: string;
    firm: string;
    portrait: string | null;
    verified: boolean;
  } | null;
  clientName: string | null;
  providerContact: ContactDto | null;
  video: {
    available: boolean;
    url: string | null;
    source: string | null;
  };
  registrationNumber: string | null;
  deadline: string | null;
  hoursLeft: number | null;
  slaBreached: boolean;
  receivedAt: string;
}

export interface LeadDto {
  id: string;
  client: string;
  clientName: string;
  clientEmail: string | null;
  projectType: string;
  city: string;
  state: string;
  budget: string;
  budgetRange: string;
  brief: string;
  receivedAt: string;
  deadline: string | null;
  hoursLeft: number | null;
  slaBreached: boolean;
  status: string;
  statusCode: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationCaseDto {
  id: string;
  providerId: string;
  name: string;
  firm: string;
  arcon: string | null;
  registrationNumber: string | null;
  city: string;
  state: string;
  submitted: string;
  sla: string;
  status: string;
  verificationStatus: string;
  email: string | null;
  note: string | null;
  documents: string[];
  documentLinks: Array<{ id: string; name: string; url: string; status: string }>;
}

export interface FavoriteDto {
  id: string;
  createdAt: string;
  provider: ProviderCardDto;
}

export interface ProviderStatsDto {
  profileViews: number;
  verificationStatus: string;
  published: boolean;
  demoAvailable: boolean;
  profileCompletion: number;
  projects: { total: number; published: number; drafts: number };
  leads: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    completed: number;
    cancelled: number;
  };
}

export interface AdminStatsDto {
  users: { total: number; clients: number };
  providers: { total: number; verified: number; published: number };
  verifications: { pending: number };
  projects: { total: number; published: number; hidden: number };
  requests: { total: number; requested: number; accepted: number; completed: number };
}

export interface ActivityItemDto {
  title: string;
  detail: string;
  time: string;
  tone: string;
}

const formatDateValue = (value: string | null | undefined) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const requestStatus = (status: string): RequestStatus => {
  if (status === "Requested" || status === "Accepted" || status === "Completed" || status === "Declined" || status === "Cancelled") {
    return status;
  }
  return "Requested";
};

export const mapProviderCard = (dto: ProviderCardDto): Architect => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  firm: dto.firm,
  city: dto.city,
  state: dto.state,
  arcon: "Verified",
  years: dto.years,
  works: dto.works,
  feeTier: dto.feeTier,
  specialties: dto.specialties,
  verified: dto.verified,
  demoAvailable: dto.demoAvailable,
  portrait: resolveAssetUrl(dto.portrait) ?? IMG.portraitA,
  cover: resolveAssetUrl(dto.cover) ?? IMG.rammedEarth,
  philosophy: dto.philosophy,
  bio: dto.bio,
});

export const mapProviderProfile = (dto: ProviderProfileDto): Architect => ({
  ...mapProviderCard(dto),
  arcon: dto.registrationNumber || "Verified",
  gated: dto.gated,
  canManage: dto.canManage,
  contact: dto.contact,
  video: dto.video,
  registrationNumber: dto.registrationNumber,
  acceptingLeads: dto.acceptingLeads,
  verificationStatus: dto.verification.status,
  verificationNote: dto.verification.note,
  verificationSubmittedAt: dto.verification.submittedAt,
  verificationDocuments: dto.verification.documents,
  experiences: dto.experiences,
  specialties: dto.specialties,
  projects: dto.projects.map(mapProjectSummary),
});

export const mapProjectSummary = (dto: ProjectSummaryDto): Project => {
  const cover = resolveAssetUrl(dto.cover) ?? IMG.rammedEarth;
  return {
    id: dto.id,
    slug: dto.slug,
    title: dto.title,
    architectSlug: dto.architectSlug ?? dto.provider?.slug ?? "",
    architectName: dto.architectName ?? dto.provider?.name ?? undefined,
    architectFirm: dto.architectFirm ?? dto.provider?.firm ?? undefined,
    architectPortrait: resolveAssetUrl(dto.provider?.portrait) ?? undefined,
    city: dto.city,
    state: dto.state,
    year: dto.year,
    typology: dto.typology,
    gfa: dto.gfa,
    budget: Number(dto.budget),
    structural: dto.structural,
    climate: dto.climate,
    cover,
    gallery: cover ? [cover] : [],
    summary: dto.summary,
    plates: [],
    status: dto.status,
  };
};

export const mapProjectDetail = (dto: ProjectDetailDto): Project => {
  const summary = mapProjectSummary(dto);
  const cover = resolveAssetUrl(dto.cover) ?? IMG.rammedEarth;
  const gallery = dto.gallery.map((url) => resolveAssetUrl(url)).filter((url): url is string => Boolean(url));
  return {
    ...summary,
    cover,
    gallery: gallery.length > 0 ? gallery : cover ? [cover] : [],
    plates: dto.plates.map((plate) => ({
      label: plate.label,
      title: plate.title,
      year: plate.year,
      scale: plate.scale,
    })),
    images: dto.images.map((image) => ({
      ...image,
      url: resolveAssetUrl(image.url) ?? image.url,
    })),
  };
};

export const mapRequest = (dto: RequestDto): DemoRequest => ({
  id: dto.id,
  architectSlug: dto.architectSlug ?? dto.provider?.slug ?? "",
  projectType: dto.projectType,
  state: dto.state,
  budget: dto.budget,
  budgetRange: dto.budgetRange,
  brief: dto.brief,
  status: requestStatus(dto.status),
  createdAt: formatDateValue(dto.createdAt),
  note: dto.note ?? undefined,
  providerName: dto.provider?.name ?? dto.architectName ?? undefined,
  providerFirm: dto.provider?.firm ?? dto.architectFirm ?? undefined,
  providerPortrait: resolveAssetUrl(dto.provider?.portrait) ?? undefined,
  providerContact: dto.providerContact,
  video: dto.video,
});

export const mapLead = (dto: LeadDto): Lead => ({
  id: dto.id,
  client: dto.clientName || dto.client,
  projectType: dto.projectType,
  city: dto.city,
  budget: dto.budget,
  brief: dto.brief,
  receivedAt: dto.receivedAt,
  deadline: dto.deadline ?? "Closed",
  status:
    dto.status === "Accepted" || dto.status === "Declined" || dto.status === "Completed" || dto.status === "Cancelled"
      ? dto.status
      : "Pending",
  note: dto.note ?? undefined,
});

export const mapVerificationCase = (dto: VerificationCaseDto): VerificationCase => ({
  id: dto.id,
  name: dto.name,
  firm: dto.firm,
  arcon: dto.registrationNumber ?? dto.arcon ?? "Not provided",
  city: dto.city,
  submitted: dto.submitted,
  sla: dto.sla,
  status:
    dto.status === "Verified" || dto.status === "Rejected" || dto.status === "Unverified"
      ? dto.status === "Unverified"
        ? "Pending"
        : dto.status
      : "Pending",
  email: dto.email ?? "",
  documents: dto.documents,
  documentLinks: dto.documentLinks,
  verificationStatus: dto.verificationStatus,
});

export const mapActivity = (dto: ActivityItemDto) => ({
  title: dto.title,
  detail: dto.detail,
  time: dto.time,
  tone: dto.tone === "verified" || dto.tone === "warning" ? dto.tone : "neutral",
});

export const authApi = {
  async login(email: string, password: string) {
    const { data } = await request<SessionPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    accessToken = data.accessToken;
    return data;
  },
  async register(input: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "PROVIDER";
    firm?: string;
    city?: string;
    state?: string;
  }) {
    const { data } = await request<SessionPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
    accessToken = data.accessToken;
    return data;
  },
  async logout() {
    try {
      await request<undefined>("/auth/logout", { method: "POST" });
    } finally {
      accessToken = null;
    }
  },
  async me() {
    const { data } = await request<AuthUserDto>("/auth/me");
    return data;
  },
};

export const refreshSession = async (): Promise<SessionPayload | null> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { data } = await rawRequest<SessionPayload>("/auth/refresh", { method: "POST" });
        accessToken = data.accessToken;
        return data;
      } catch (error) {
        accessToken = null;
        if (error instanceof ApiError && error.status === 401) return null;
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
};

export const providerApi = {
  async list(params: {
    page?: number;
    pageSize?: number;
    q?: string;
    state?: string;
    specialty?: string;
    feeTier?: string;
    minYears?: number;
    maxYears?: number;
    demo?: boolean;
    sort?: string;
  } = {}) {
    const { data, meta } = await request<ProviderCardDto[]>(`/providers${queryString(params)}`);
    return { items: data.map(mapProviderCard), meta };
  },
  async get(idOrSlug: string) {
    const { data, meta } = await request<ProviderProfileDto>(`/providers/${encodeURIComponent(idOrSlug)}`);
    return { architect: mapProviderProfile(data), access: meta?.access as string | undefined };
  },
  async me() {
    const { data } = await request<ProviderProfileDto>("/me/provider-profile");
    return mapProviderProfile(data);
  },
  async update(input: Record<string, unknown>) {
    const { data } = await request<ProviderProfileDto>("/me/provider-profile", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return mapProviderProfile(data);
  },
  async setDemoVideo(url: string) {
    const { data } = await request<ProviderProfileDto>("/me/demo-video", {
      method: "PUT",
      body: JSON.stringify({ url }),
    });
    return mapProviderProfile(data);
  },
  async stats() {
    const { data } = await request<ProviderStatsDto>("/me/provider/stats");
    return data;
  },
};

export const projectApi = {
  async list(params: { page?: number; pageSize?: number; q?: string; provider?: string; state?: string; typology?: string; year?: number; sort?: string } = {}) {
    const { data, meta } = await request<ProjectSummaryDto[]>(`/projects${queryString(params)}`);
    return { items: data.map(mapProjectSummary), meta };
  },
  async get(idOrSlug: string) {
    const { data, meta } = await request<ProjectDetailDto>(`/projects/${encodeURIComponent(idOrSlug)}`);
    return { project: mapProjectDetail(data), access: meta?.access as string | undefined };
  },
  async mine(id: string) {
    const { data } = await request<ProjectDetailDto>(`/me/projects/${encodeURIComponent(id)}`);
    return mapProjectDetail(data);
  },
  async mineList(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { data, meta } = await request<ProjectSummaryDto[]>(`/me/projects${queryString(params)}`);
    return { items: data.map(mapProjectSummary), meta };
  },
  async update(id: string, input: Record<string, unknown>) {
    const { data } = await request<ProjectDetailDto>(`/me/projects/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return mapProjectDetail(data);
  },
};

export const requestApi = {
  async listMine(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { data, meta } = await request<RequestDto[]>(`/me/demo-requests${queryString(params)}`);
    return { items: data.map(mapRequest), meta };
  },
  async create(input: {
    providerSlug: string;
    projectType: string;
    state: string;
    budgetRange: string;
    brief: string;
    location?: string;
  }) {
    const { data } = await request<{ request: RequestDto }>("/demo-requests", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return mapRequest(data.request);
  },
  async get(id: string) {
    const { data } = await request<RequestDto>(`/me/demo-requests/${encodeURIComponent(id)}`);
    return mapRequest(data);
  },
  async cancel(id: string) {
    const { data } = await request<RequestDto>(`/me/demo-requests/${encodeURIComponent(id)}/cancel`, { method: "POST" });
    return mapRequest(data);
  },
};

export const leadApi = {
  async list(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { data, meta } = await request<LeadDto[]>(`/me/leads${queryString(params)}`);
    return { items: data.map(mapLead), meta };
  },
  async update(id: string, input: { status: string; note?: string }) {
    const { data } = await request<LeadDto>(`/me/leads/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
    return mapLead(data);
  },
};

export const favoriteApi = {
  async list(params: { page?: number; pageSize?: number } = {}) {
    const { data } = await request<FavoriteDto[]>(`/me/favorites${queryString(params)}`);
    return data.map((favorite) => ({
      id: favorite.id,
      architect: mapProviderCard(favorite.provider),
    }));
  },
  async add(providerId: string) {
    const { data } = await request<FavoriteDto>("/me/favorites", {
      method: "POST",
      body: JSON.stringify({ providerId }),
    });
    return mapProviderCard(data.provider);
  },
  async remove(providerId: string) {
    await request<undefined>(`/me/favorites/${encodeURIComponent(providerId)}`, { method: "DELETE" });
  },
};

export const adminApi = {
  async stats() {
    const { data } = await request<AdminStatsDto>("/admin/stats");
    return data;
  },
  async verifications(params: { page?: number; pageSize?: number; status?: string } = {}) {
    const { data, meta } = await request<VerificationCaseDto[]>(`/admin/verifications${queryString(params)}`);
    return { items: data.map(mapVerificationCase), meta };
  },
  async decideVerification(providerId: string, status: "VERIFIED" | "REJECTED", note?: string) {
    const { data } = await request<VerificationCaseDto>(`/admin/providers/${encodeURIComponent(providerId)}/verification`, {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    });
    return mapVerificationCase(data);
  },
  async activity() {
    const { data } = await request<ActivityItemDto[]>("/admin/activity");
    return data.map(mapActivity);
  },
};

export const uploadApi = {
  async sign(input: { folder: string; fileName: string; contentType: string; size: number }) {
    const { data } = await request<{
      uploadUrl: string;
      method: string;
      fields?: Record<string, string>;
      publicUrl?: string | null;
      token?: string;
      headers?: Record<string, string>;
    }>("/uploads/sign", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return data;
  },
  async upload(file: File, folder: string) {
    const signed = await this.sign({
      folder,
      fileName: file.name,
      contentType: file.type,
      size: file.size,
    });
    if (signed.method === "PUT") {
      const response = await fetch(signed.uploadUrl, {
        method: "PUT",
        headers: signed.headers,
        body: file,
      });
      if (!response.ok) throw new ApiError(response.status, "UPLOAD_FAILED", "Upload failed. Please try again.");
      const payload = (await response.json()) as { data?: { url?: string } };
      const url = payload.data?.url ?? signed.publicUrl;
      if (!url) throw new ApiError(500, "UPLOAD_FAILED", "Upload succeeded but no file URL was returned.");
      return url;
    }
    const form = new FormData();
    Object.entries(signed.fields ?? {}).forEach(([key, value]) => form.append(key, value));
    form.append("file", file);
    const response = await fetch(signed.uploadUrl, { method: "POST", body: form });
    if (!response.ok) throw new ApiError(response.status, "UPLOAD_FAILED", "Upload failed. Please try again.");
    const payload = (await response.json()) as { secure_url?: string; url?: string };
    const url = payload.secure_url ?? payload.url ?? signed.publicUrl;
    if (!url) throw new ApiError(500, "UPLOAD_FAILED", "Upload succeeded but no file URL was returned.");
    return url;
  },
};

export const getApiBaseUrl = () => API_BASE_URL;

