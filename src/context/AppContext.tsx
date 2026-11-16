import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  leadsSeed,
  requestsSeed,
  verificationSeed,
  type DemoRequest,
  type Lead,
  type VerificationCase,
} from "../data";
import {
  AppContext,
  type AppContextValue,
  type NewRequestInput,
  type Role,
} from "./context";

const readStored = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(() => readStored<Role>("archng.role", "client"));
  const [signedIn, setSignedIn] = useState(() => readStored<boolean>("archng.signedIn", false));
  const [requests, setRequests] = useState<DemoRequest[]>(() =>
    readStored<DemoRequest[]>("archng.requests", requestsSeed),
  );
  const [saved, setSaved] = useState<string[]>(() => readStored<string[]>("archng.saved", []));
  const [leads, setLeads] = useState<Lead[]>(leadsSeed);
  const [verification, setVerification] = useState<VerificationCase[]>(verificationSeed);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("archng.role", JSON.stringify(role));
  }, [role]);

  useEffect(() => {
    localStorage.setItem("archng.signedIn", JSON.stringify(signedIn));
  }, [signedIn]);

  useEffect(() => {
    localStorage.setItem("archng.requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("archng.saved", JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);

  const signIn = useCallback(
    (nextRole: Role) => {
      setRole(nextRole);
      setSignedIn(true);
    },
    [],
  );

  const signOut = useCallback(() => {
    setSignedIn(false);
    setRole("client");
  }, []);

  const addRequest = useCallback((input: NewRequestInput) => {
    const id = `r${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    setRequests((current) => [
      { id, status: "Requested", createdAt, ...input },
      ...current,
    ]);
    return id;
  }, []);

  const toggleSave = useCallback((slug: string) => {
    setSaved((current) =>
      current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
    );
  }, []);

  const hasAccepted = useCallback(
    (slug: string) =>
      requests.some(
        (request) =>
          request.architectSlug === slug &&
          (request.status === "Accepted" || request.status === "Completed"),
      ),
    [requests],
  );

  const decideLead = useCallback(
    (id: string, status: "Accepted" | "Declined") => {
      setLeads((current) =>
        current.map((lead) => (lead.id === id ? { ...lead, status } : lead)),
      );
      setToast(status === "Accepted" ? "Commission request accepted." : "Commission request declined.");
    },
    [],
  );

  const decideVerification = useCallback(
    (id: string, status: "Verified" | "Rejected") => {
      setVerification((current) =>
        current.map((item) => (item.id === id ? { ...item, status, sla: status } : item)),
      );
      setToast(status === "Verified" ? "Practitioner approved and verified." : "Filing rejected.");
    },
    [],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      role,
      setRole,
      signedIn,
      signIn,
      signOut,
      requests,
      addRequest,
      saved,
      toggleSave,
      hasAccepted,
      leads,
      decideLead,
      verification,
      decideVerification,
      toast,
      notify,
    }),
    [
      role,
      signedIn,
      signIn,
      signOut,
      requests,
      addRequest,
      saved,
      toggleSave,
      hasAccepted,
      leads,
      decideLead,
      verification,
      decideVerification,
      toast,
      notify,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
