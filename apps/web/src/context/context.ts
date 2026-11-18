import { createContext, useContext } from "react";
import type {
  AdminStatsDto,
  ActivityItemDto,
  AuthUserDto,
  ProviderStatsDto,
} from "../lib/api";
import type {
  Architect,
  DemoRequest,
  Lead,
  Project,
  VerificationCase,
} from "../data";

export type Role = "client" | "architect" | "admin";

export interface NewRequestInput {
  architectSlug: string;
  projectType: string;
  state: string;
  budgetRange: string;
  location?: string;
  brief: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: "client" | "architect";
  firm?: string;
  city?: string;
  state?: string;
}

export interface AppContextValue {
  user: AuthUserDto | null;
  role: Role;
  signedIn: boolean;
  ready: boolean;
  bootError: string | null;
  signIn: (email: string, password: string) => Promise<Role>;
  register: (input: RegisterInput) => Promise<Role>;
  signOut: () => Promise<void>;
  retryBoot: () => Promise<void>;

  architects: Architect[];
  projects: Project[];
  catalogLoading: boolean;
  catalogError: string | null;
  refreshCatalog: () => Promise<void>;
  getArchitect: (slug: string) => Architect | undefined;
  getProject: (idOrSlug: string) => Project | undefined;
  getProjectsByArchitect: (slug: string) => Project[];
  loadArchitect: (idOrSlug: string) => Promise<Architect | undefined>;
  loadProject: (idOrSlug: string) => Promise<Project | undefined>;

  requests: DemoRequest[];
  requestsLoading: boolean;
  refreshRequests: () => Promise<void>;
  addRequest: (input: NewRequestInput) => Promise<string>;
  cancelRequest: (id: string) => Promise<DemoRequest>;
  hasAccepted: (slug: string) => boolean;

  saved: string[];
  favoritesLoading: boolean;
  toggleSave: (slug: string) => Promise<boolean>;
  refreshFavorites: () => Promise<void>;

  leads: Lead[];
  leadsLoading: boolean;
  refreshLeads: () => Promise<void>;
  decideLead: (id: string, status: "Accepted" | "Declined" | "Completed", note?: string) => Promise<void>;

  verification: VerificationCase[];
  verificationLoading: boolean;
  refreshVerification: () => Promise<void>;
  decideVerification: (id: string, status: "Verified" | "Rejected", note?: string) => Promise<void>;

  providerProfile: Architect | null;
  providerStats: ProviderStatsDto | null;
  providerLoading: boolean;
  refreshProvider: () => Promise<void>;
  updateProviderProfile: (input: Record<string, unknown>) => Promise<Architect>;
  setDemoVideo: (url: string) => Promise<Architect>;

  adminStats: AdminStatsDto | null;
  adminActivity: ActivityItemDto[];
  adminLoading: boolean;
  refreshAdmin: () => Promise<void>;

  toast: string | null;
  notify: (message: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
