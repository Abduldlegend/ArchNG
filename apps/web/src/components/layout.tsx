import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/context";
import { cn } from "../lib/cn";
import { Badge, Button, Icon, LinkButton } from "./ui";

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.slice(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

const publicNav = [
  { label: "Architects", to: "/architects" },
  { label: "Projects", to: "/projects/the-epe-courtyard-villa" },
  { label: "How it works", to: "/#how-it-works" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-serif text-headline-sm tracking-tight text-ink">
      <span>ArchNG</span>
      <span className="text-terracotta">.</span>
      {!compact && (
        <span className="hidden border-l border-hairline-strong pl-3 text-caps uppercase tracking-[0.1em] text-stone-soft lg:inline">
          Nigerian ARCON Registry
        </span>
      )}
    </Link>
  );
}

function PublicHeader() {
  const { signedIn, role, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const accountTo = role === "architect" ? "/provider" : role === "admin" ? "/admin" : "/requests";

  const handleSignOut = async () => {
    setOpen(false);
    await signOut().catch(() => undefined);
    navigate("/");
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-hairline bg-surface/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
          <div className="flex items-center gap-6">
            <Brand />
          </div>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {publicNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "text-label transition-colors hover:text-terracotta",
                    isActive ? "text-ink" : "text-stone",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-2.5 md:flex">
            <Link
              to="/architects"
              className="flex h-10 w-10 items-center justify-center rounded-full text-stone transition-colors hover:bg-surface-low hover:text-ink"
              aria-label="Search architects"
            >
              <Icon name="search" />
            </Link>
            {signedIn ? (
              <>
                <LinkButton to={accountTo} variant="secondary" size="sm">
                  <Icon name="account_circle" className="text-[18px]" />
                  My account
                </LinkButton>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-2 lg:px-3.5"
                  onClick={() => void handleSignOut()}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <Icon name="logout" className="text-[18px]" />
                  <span className="hidden lg:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <LinkButton to="/signin" variant="secondary" size="sm">
                Sign in
              </LinkButton>
            )}
            <LinkButton to="/register" size="sm">
              Join as an architect
              <Icon name="north_east" className="text-[15px]" />
            </LinkButton>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-hairline-strong bg-card text-ink md:hidden"
            aria-label="Open menu"
          >
            <Icon name="menu" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-3 top-3 rounded-panel border border-hairline bg-card p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <Brand compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-surface-low"
                aria-label="Close menu"
              >
                <Icon name="close" />
              </button>
            </div>
            <nav className="mt-6 flex flex-col" aria-label="Mobile">
              {publicNav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between border-b border-hairline py-4 text-title text-ink"
                >
                  {item.label}
                  <Icon name="arrow_outward" className="text-[18px] text-stone" />
                </Link>
              ))}
              <Link
                to={signedIn ? accountTo : "/signin"}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-hairline py-4 text-title text-ink"
              >
                {signedIn ? "My account" : "Sign in"}
                <Icon name="person" className="text-[18px] text-stone" />
              </Link>
              {signedIn && (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex items-center justify-between border-b border-hairline py-4 text-left text-title text-ink"
                >
                  Sign out
                  <Icon name="logout" className="text-[18px] text-stone" />
                </button>
              )}
            </nav>
            <LinkButton to="/register" className="mt-6 w-full" size="lg" variant="primary">
              Join as an architect
            </LinkButton>
          </div>
        </div>
      )}
    </>
  );
}

const bottomNav = [
  { label: "Discover", icon: "explore", to: "/" },
  { label: "Directory", icon: "grid_view", to: "/architects" },
  { label: "Saved", icon: "bookmark", to: "/saved" },
  { label: "Inquiries", icon: "forum", to: "/requests" },
];

function MobileDock() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-card/95 backdrop-blur-md md:hidden"
      aria-label="Mobile dock"
    >
      <div className="grid h-16 grid-cols-4">
        {bottomNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.07em] transition-colors",
                isActive ? "text-terracotta" : "text-stone",
              )
            }
          >
            <Icon name={item.icon} filled className="text-[21px]" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

const footerColumns = [
  {
    title: "Regional registry hubs",
    links: [
      ["Lagos", "/architects"],
      ["Abuja Central", "/architects"],
      ["Port Harcourt", "/architects"],
      ["Ibadan", "/architects"],
      ["Enugu", "/architects"],
    ],
  },
  {
    title: "Practice standards",
    links: [
      ["ARCON CAP A19 LFN 2004", "/#how-it-works"],
      ["Verification protocol", "/#how-it-works"],
      ["Form B filing guidance", "/#how-it-works"],
      ["System states", "/system-states"],
    ],
  },
  {
    title: "Client safeguards",
    links: [
      ["Escrow protections", "/#how-it-works"],
      ["Inspection rights", "/#how-it-works"],
      ["Commission code", "/#how-it-works"],
      ["Report a concern", "/#how-it-works"],
    ],
  },
];

function PublicFooter() {
  return (
    <footer className="border-t border-hairline bg-sand pb-20 pt-14 md:pb-14">
      <div className="container-page">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Brand compact />
            <p className="mt-4 max-w-xs text-body-sm leading-relaxed text-stone">
              A curated registry of ARCON-verified architectural practices and their built work across Nigeria.
              Commissions are documented, verified, and archived.
            </p>
            <Badge tone="verified" className="mt-5">
              <Icon name="verified" filled className="text-[14px]" />
              Statutory registry
            </Badge>
          </div>
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-caps uppercase tracking-[0.09em] text-stone-soft">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-body-sm text-stone transition-colors hover:text-terracotta">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-hairline-strong pt-5 text-body-sm text-stone-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 ArchNG. Nigerian Architectural Registry &amp; Commissioning Monograph.</span>
          <span className="text-caps uppercase tracking-[0.08em]">Light editorial edition · v1.0</span>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <MobileDock />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-hairline bg-surface-low/60">
      <div className="container-page py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-3xl">
            <span className="text-caps uppercase tracking-[0.1em] text-stone-soft">{eyebrow}</span>
            <h1 className="mt-3 font-serif text-headline-xl text-ink md:text-display">{title}</h1>
            {description && <p className="mt-4 max-w-2xl text-body text-stone md:text-body-lg">{description}</p>}
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  );
}

const providerNav = [
  { label: "Dashboard", icon: "space_dashboard", to: "/provider", end: true },
  { label: "Profile", icon: "badge", to: "/provider/profile" },
  { label: "Projects", icon: "apartment", to: "/provider/projects/the-epe-courtyard-villa/edit" },
  { label: "Demo video", icon: "play_circle", to: "/provider/profile#demo" },
  { label: "Leads & inquiries", icon: "forum", to: "/provider/leads" },
  { label: "Verification", icon: "verified_user", to: "/provider/profile#verification" },
];

export function ProviderShell() {
  const { user, role, signedIn, providerProfile, signOut, notify } = useApp();
  const navigate = useNavigate();

  if (!signedIn) return <Navigate to="/signin" replace />;
  if (role !== "architect") return <Navigate to={role === "admin" ? "/admin" : "/requests"} replace />;

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <ScrollToTop />
      <aside className="hidden w-[260px] shrink-0 border-r border-hairline bg-surface-low lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
        <div className="border-b border-hairline px-5 py-5">
          <Brand compact />
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-hairline bg-card p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-verified text-white">
              <Icon name="architecture" className="text-[20px]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-label text-ink">{providerProfile?.firm ?? user?.name}</p>
              <p className="text-[11px] text-stone tnum">
                {providerProfile?.registrationNumber ?? "ARCON pending"} · {providerProfile?.state ?? "State pending"}
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Practice workspace">
          {providerNav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-label transition-colors",
                  isActive
                    ? "bg-ink text-white"
                    : "text-stone hover:bg-card hover:text-ink",
                )
              }
            >
              <Icon name={item.icon} className="text-[19px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-hairline px-3 py-4">
          <button
            type="button"
            onClick={() => notify("ARCON registry support is available Mon–Fri, 9am–5pm WAT.")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-stone hover:bg-card hover:text-ink"
          >
            <Icon name="support_agent" className="text-[18px]" />
            ARCON registry support
          </button>
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-stone hover:bg-card hover:text-ink">
            <Icon name="public" className="text-[18px]" />
            Public directory
          </Link>
          <button
            type="button"
            onClick={() => {
              void signOut().then(() => navigate("/"));
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-stone hover:bg-card hover:text-ink"
          >
            <Icon name="logout" className="text-[18px]" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-hairline bg-card/95 backdrop-blur-md lg:hidden">
          <div className="flex h-14 items-center justify-between px-4">
            <Brand compact />
            <div className="flex items-center gap-2">
              <Badge tone={providerProfile?.verified ? "verified" : "warning"}>
                {providerProfile?.verified ? "Verified" : "In review"}
              </Badge>
              <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-surface-low" aria-label="Public site">
                <Icon name="public" />
              </Link>
            </div>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {providerNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors",
                    isActive
                      ? "border-ink bg-ink text-white"
                      : "border-hairline-strong bg-card text-stone",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const adminNav = [
  { label: "Council dashboard", icon: "space_dashboard", to: "/admin", end: true },
  { label: "Verification queue", icon: "verified_user", to: "/admin/verification" },
];

export function AdminShell() {
  const { user, role, signedIn, notify } = useApp();

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AR";

  if (!signedIn) return <Navigate to="/signin" replace />;
  if (role !== "admin") return <Navigate to={role === "architect" ? "/provider" : "/requests"} replace />;

  return (
    <div className="min-h-screen bg-surface">
      <ScrollToTop />
      <div className="border-b border-hairline bg-ink text-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-2 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/70">
            <span className="uppercase tracking-[0.1em] text-white/50">Active chapters</span>
            {["Lagos", "Abuja FCT", "Port Harcourt", "Ibadan", "Enugu"].map((state) => (
              <span key={state} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-verified" />
                {state}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-white/70">
            <span className="hidden sm:inline">ARCON Registrar console</span>
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-[10px] font-semibold text-white">
                {initials}
              </span>
              {user?.name ?? "Registrar"}
            </span>
          </div>
        </div>
      </div>

      <div className="lg:flex">
        <aside className="border-b border-hairline bg-surface-low lg:w-[248px] lg:shrink-0 lg:border-b-0 lg:border-r lg:sticky lg:top-0 lg:h-screen">
          <div className="px-5 py-5">
            <Brand compact />
            <p className="mt-2 text-caps uppercase tracking-[0.1em] text-stone-soft">Statutory council shell</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:space-y-1 lg:pb-0" aria-label="Council console">
            {adminNav.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-label transition-colors",
                    isActive ? "bg-ink text-white" : "text-stone hover:bg-card hover:text-ink",
                  )
                }
              >
                <Icon name={item.icon} className="text-[19px]" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 space-y-1 border-t border-hairline px-3 py-4">
            <button
              type="button"
              onClick={() => notify("Registrar dossier search is available in the production console.")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-stone hover:bg-card hover:text-ink"
            >
              <Icon name="manage_search" className="text-[18px]" />
              Dossier search
            </button>
            <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-body-sm text-stone hover:bg-card hover:text-ink">
              <Icon name="public" className="text-[18px]" />
              Public registry
            </Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
