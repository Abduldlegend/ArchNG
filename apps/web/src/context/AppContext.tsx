import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AdminStatsDto,
  ActivityItemDto,
  AuthUserDto,
  ProviderStatsDto,
} from "../lib/api";
import {
  ApiError,
  adminApi,
  authApi,
  favoriteApi,
  leadApi,
  projectApi,
  providerApi,
  refreshSession,
  requestApi,
  setAccessToken,
} from "../lib/api";
import {
  type Architect,
  type DemoRequest,
  type Lead,
  type Project,
  type VerificationCase,
} from "../data";
import {
  AppContext,
  type AppContextValue,
  type NewRequestInput,
  type RegisterInput,
  type Role,
} from "./context";

const roleFor = (user: AuthUserDto | null): Role => {
  if (user?.role === "ADMIN") return "admin";
  if (user?.role === "PROVIDER") return "architect";
  return "client";
};

const errorMessage = (error: unknown) =>
  error instanceof ApiError ? error.message : "Unable to reach the registry. Please try again.";

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUserDto | null>(null);
  const [ready, setReady] = useState(false);
  const [bootError, setBootError] = useState<string | null>(null);

  const [architects, setArchitects] = useState<Architect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationCase[]>([]);
  const [verificationLoading, setVerificationLoading] = useState(false);

  const [providerProfile, setProviderProfile] = useState<Architect | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStatsDto | null>(null);
  const [providerLoading, setProviderLoading] = useState(false);

  const [adminStats, setAdminStats] = useState<AdminStatsDto | null>(null);
  const [adminActivity, setAdminActivity] = useState<ActivityItemDto[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  const role = roleFor(user);
  const signedIn = Boolean(user);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message: string) => setToast(message), []);

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const [providerResult, projectResult] = await Promise.all([
        providerApi.list({ pageSize: 50, sort: "recommended" }),
        projectApi.list({ pageSize: 50, sort: "year" }),
      ]);
      setArchitects(providerResult.items);
      setProjects(projectResult.items);
    } catch (error) {
      setCatalogError(errorMessage(error));
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const boot = useCallback(async () => {
    setReady(false);
    setBootError(null);
    const catalogPromise = refreshCatalog();
    try {
      const session = await refreshSession();
      setUser(session?.user ?? null);
    } catch (error) {
      setBootError(errorMessage(error));
    }
    await catalogPromise;
    setReady(true);
  }, [refreshCatalog]);

  useEffect(() => {
    void boot();
  }, [boot]);

  useEffect(() => {
    const handleUnauthorized = () => {
      setAccessToken(null);
      setUser(null);
      setRequests([]);
      setSaved([]);
      setLeads([]);
      setVerification([]);
      setProviderProfile(null);
      setProviderStats(null);
      setAdminStats(null);
      setAdminActivity([]);
      setToast("Your session expired. Sign in again to continue.");
    };
    window.addEventListener("archng:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("archng:unauthorized", handleUnauthorized);
  }, []);

  const refreshRequests = useCallback(async () => {
    if (!user) {
      setRequests([]);
      return;
    }
    setRequestsLoading(true);
    try {
      const result = await requestApi.listMine({ pageSize: 50 });
      setRequests(result.items);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setRequestsLoading(false);
    }
  }, [user]);

  const refreshFavorites = useCallback(async () => {
    if (!user) {
      setSaved([]);
      return;
    }
    setFavoritesLoading(true);
    try {
      const favorites = await favoriteApi.list({ pageSize: 50 });
      setSaved(favorites.map((favorite) => favorite.architect.slug));
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setFavoritesLoading(false);
    }
  }, [user]);

  const refreshLeads = useCallback(async () => {
    if (!user || role !== "architect") {
      setLeads([]);
      return;
    }
    setLeadsLoading(true);
    try {
      const result = await leadApi.list({ pageSize: 50 });
      setLeads(result.items);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setLeadsLoading(false);
    }
  }, [user, role]);

  const refreshProvider = useCallback(async () => {
    if (!user || role !== "architect") {
      setProviderProfile(null);
      setProviderStats(null);
      return;
    }
    setProviderLoading(true);
    try {
      const [profile, stats] = await Promise.all([providerApi.me(), providerApi.stats()]);
      setProviderProfile(profile);
      setProviderStats(stats);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setProviderLoading(false);
    }
  }, [user, role]);

  const refreshVerification = useCallback(async () => {
    if (!user || role !== "admin") {
      setVerification([]);
      return;
    }
    setVerificationLoading(true);
    try {
      const result = await adminApi.verifications({ pageSize: 50 });
      setVerification(result.items);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setVerificationLoading(false);
    }
  }, [user, role]);

  const refreshAdmin = useCallback(async () => {
    if (!user || role !== "admin") {
      setAdminStats(null);
      setAdminActivity([]);
      return;
    }
    setAdminLoading(true);
    try {
      const [stats, activity] = await Promise.all([adminApi.stats(), adminApi.activity()]);
      setAdminStats(stats);
      setAdminActivity(activity);
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) setToast(errorMessage(error));
    } finally {
      setAdminLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (!ready) return;
    void refreshRequests();
    void refreshFavorites();
    if (role === "architect") {
      void refreshLeads();
      void refreshProvider();
    } else {
      setLeads([]);
      setProviderProfile(null);
      setProviderStats(null);
    }
    if (role === "admin") {
      void refreshVerification();
      void refreshAdmin();
    } else {
      setVerification([]);
      setAdminStats(null);
      setAdminActivity([]);
    }
  }, [ready, role, user?.id, refreshRequests, refreshFavorites, refreshLeads, refreshProvider, refreshVerification, refreshAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authApi.login(email, password);
    setAccessToken(session.accessToken);
    setUser(session.user);
    return roleFor(session.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authApi.register({
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role === "architect" ? "PROVIDER" : "USER",
      ...(input.role === "architect"
        ? {
            firm: input.firm || `${input.name} Studio`,
            city: input.city,
            state: input.state,
          }
        : {}),
    });
    setAccessToken(session.accessToken);
    setUser(session.user);
    return roleFor(session.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setRequests([]);
      setSaved([]);
      setLeads([]);
      setVerification([]);
      setProviderProfile(null);
      setProviderStats(null);
      setAdminStats(null);
      setAdminActivity([]);
    }
  }, []);

  const retryBoot = useCallback(async () => {
    await boot();
  }, [boot]);

  const getArchitect = useCallback(
    (slug: string) => architects.find((item) => item.slug === slug),
    [architects],
  );

  const getProject = useCallback(
    (idOrSlug: string) => projects.find((item) => item.slug === idOrSlug || item.id === idOrSlug),
    [projects],
  );

  const getProjectsByArchitect = useCallback(
    (slug: string) => projects.filter((item) => item.architectSlug === slug),
    [projects],
  );

  const loadArchitect = useCallback(async (idOrSlug: string) => {
    try {
      const { architect } = await providerApi.get(idOrSlug);
      setArchitects((current) => {
        const index = current.findIndex((item) => item.id === architect.id);
        if (index === -1) return [...current, architect];
        const next = [...current];
        next[index] = { ...next[index], ...architect };
        return next;
      });
      return architect;
    } catch (error) {
      notify(errorMessage(error));
      return undefined;
    }
  }, [notify]);

  const loadProject = useCallback(async (idOrSlug: string) => {
    try {
      const { project } = await projectApi.get(idOrSlug);
      setProjects((current) => {
        const index = current.findIndex((item) => item.id === project.id);
        if (index === -1) return [...current, project];
        const next = [...current];
        next[index] = { ...next[index], ...project };
        return next;
      });
      return project;
    } catch (error) {
      notify(errorMessage(error));
      return undefined;
    }
  }, [notify]);

  const addRequest = useCallback(async (input: NewRequestInput) => {
    const created = await requestApi.create({
      providerSlug: input.architectSlug,
      projectType: input.projectType,
      state: input.state,
      budgetRange: input.budgetRange,
      brief: input.brief,
      location: input.location,
    });
    setRequests((current) => [created, ...current]);
    return created.id;
  }, []);

  const cancelRequest = useCallback(async (id: string) => {
    const updated = await requestApi.cancel(id);
    setRequests((current) => current.map((item) => (item.id === id ? updated : item)));
    return updated;
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

  const toggleSave = useCallback(
    async (slug: string) => {
      if (!user) {
        notify("Sign in to save practices to your archive.");
        return false;
      }
      const architect = architects.find((item) => item.slug === slug);
      if (!architect) {
        notify("Practice not found. Refresh the directory and try again.");
        return false;
      }
      const isSaved = saved.includes(slug);
      try {
        if (isSaved) {
          await favoriteApi.remove(architect.id);
          setSaved((current) => current.filter((item) => item !== slug));
          notify(`${architect.firm} removed from your archive.`);
        } else {
          await favoriteApi.add(architect.id);
          setSaved((current) => [...current, slug]);
          notify(`${architect.firm} saved to your archive.`);
        }
        return true;
      } catch (error) {
        notify(errorMessage(error));
        return false;
      }
    },
    [architects, notify, saved, user],
  );

  const decideLead = useCallback(
    async (id: string, status: "Accepted" | "Declined" | "Completed", note?: string) => {
      try {
        const updated = await leadApi.update(id, {
          status: status.toUpperCase(),
          note,
        });
        setLeads((current) => current.map((item) => (item.id === id ? updated : item)));
        notify(
          status === "Accepted"
            ? "Commission request accepted."
            : status === "Declined"
              ? "Commission request declined."
              : "Commission marked completed.",
        );
        void refreshProvider();
      } catch (error) {
        notify(errorMessage(error));
        throw error;
      }
    },
    [notify, refreshProvider],
  );

  const decideVerification = useCallback(
    async (id: string, status: "Verified" | "Rejected", note?: string) => {
      try {
        const updated = await adminApi.decideVerification(
          id,
          status === "Verified" ? "VERIFIED" : "REJECTED",
          note,
        );
        setVerification((current) => current.map((item) => (item.id === id ? updated : item)));
        notify(status === "Verified" ? "Practitioner approved and verified." : "Filing rejected.");
        void refreshAdmin();
      } catch (error) {
        notify(errorMessage(error));
        throw error;
      }
    },
    [notify, refreshAdmin],
  );

  const updateProviderProfile = useCallback(
    async (input: Record<string, unknown>) => {
      const profile = await providerApi.update(input);
      setProviderProfile(profile);
      notify("Practice profile saved.");
      void refreshProvider();
      return profile;
    },
    [notify, refreshProvider],
  );

  const setDemoVideo = useCallback(
    async (url: string) => {
      const profile = await providerApi.setDemoVideo(url);
      setProviderProfile(profile);
      notify(url ? "Demo video saved." : "Demo video removed.");
      return profile;
    },
    [notify],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      role,
      signedIn,
      ready,
      bootError,
      signIn,
      register,
      signOut,
      retryBoot,
      architects,
      projects,
      catalogLoading,
      catalogError,
      refreshCatalog,
      getArchitect,
      getProject,
      getProjectsByArchitect,
      loadArchitect,
      loadProject,
      requests,
      requestsLoading,
      refreshRequests,
      addRequest,
      cancelRequest,
      hasAccepted,
      saved,
      favoritesLoading,
      toggleSave,
      refreshFavorites,
      leads,
      leadsLoading,
      refreshLeads,
      decideLead,
      verification,
      verificationLoading,
      refreshVerification,
      decideVerification,
      providerProfile,
      providerStats,
      providerLoading,
      refreshProvider,
      updateProviderProfile,
      setDemoVideo,
      adminStats,
      adminActivity,
      adminLoading,
      refreshAdmin,
      toast,
      notify,
    }),
    [
      user,
      role,
      signedIn,
      ready,
      bootError,
      signIn,
      register,
      signOut,
      retryBoot,
      architects,
      projects,
      catalogLoading,
      catalogError,
      refreshCatalog,
      getArchitect,
      getProject,
      getProjectsByArchitect,
      loadArchitect,
      loadProject,
      requests,
      requestsLoading,
      refreshRequests,
      addRequest,
      cancelRequest,
      hasAccepted,
      saved,
      favoritesLoading,
      toggleSave,
      refreshFavorites,
      leads,
      leadsLoading,
      refreshLeads,
      decideLead,
      verification,
      verificationLoading,
      refreshVerification,
      decideVerification,
      providerProfile,
      providerStats,
      providerLoading,
      refreshProvider,
      updateProviderProfile,
      setDemoVideo,
      adminStats,
      adminActivity,
      adminLoading,
      refreshAdmin,
      toast,
      notify,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
