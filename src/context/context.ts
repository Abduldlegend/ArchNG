import { createContext, useContext } from "react";
import type { DemoRequest, Lead, VerificationCase } from "../data";

export type Role = "client" | "architect" | "admin";

export interface NewRequestInput {
  architectSlug: string;
  projectType: string;
  state: string;
  budget: string;
  brief: string;
}

export interface AppContextValue {
  role: Role;
  setRole: (role: Role) => void;
  signedIn: boolean;
  signIn: (role: Role) => void;
  signOut: () => void;
  requests: DemoRequest[];
  addRequest: (input: NewRequestInput) => string;
  saved: string[];
  toggleSave: (slug: string) => void;
  hasAccepted: (slug: string) => boolean;
  leads: Lead[];
  decideLead: (id: string, status: "Accepted" | "Declined") => void;
  verification: VerificationCase[];
  decideVerification: (id: string, status: "Verified" | "Rejected") => void;
  toast: string | null;
  notify: (message: string) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
