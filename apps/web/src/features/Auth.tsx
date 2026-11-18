import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IMG } from "../data";
import { useApp, type Role } from "../context/context";
import { cn } from "../lib/cn";
import { Badge, Button, Eyebrow, Field, Icon, Input, Select } from "../components/ui";

const destination: Record<Role, string> = {
  client: "/requests",
  architect: "/provider",
  admin: "/admin",
};

export default function Auth() {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { signIn, register } = useApp();
  const isRegister = pathname === "/register";
  const next = new URLSearchParams(search).get("next");

  const [role, setRole] = useState<Role>("client");
  const [name, setName] = useState("");
  const [firm, setFirm] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (mode: "signin" | "register") => {
    setError("");
    navigate(mode === "signin" ? "/signin" : "/register");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (isRegister && name.trim().length < 2) {
      setError("Enter the principal or client name.");
      return;
    }
    if (isRegister && role === "architect" && firm.trim().length < 2) {
      setError("Enter your registered practice name.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const actualRole = isRegister
        ? await register({
            name,
            email,
            password,
            role: role === "architect" ? "architect" : "client",
            firm: firm || undefined,
            city: city || undefined,
            state: state || undefined,
          })
        : await signIn(email, password);
      navigate(next || destination[actualRole]);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Unable to sign in. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface lg:grid lg:grid-cols-[1.05fr_0.95fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <img src={IMG.atrium} alt="Architectural courtyard" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-ink/10" />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center gap-2 font-serif text-headline-sm">
            ArchNG<span className="text-terracotta">.</span>
          </Link>
          <div className="max-w-md">
            <Badge className="border-white/20 bg-white/10 text-white">
              <Icon name="verified" filled className="text-[14px]" />
              Nigerian ARCON registry
            </Badge>
            <h1 className="mt-5 font-serif text-display">
              A practice record you can actually verify.
            </h1>
            <p className="mt-4 text-body text-white/70">
              Sign in to track consultation requests, unlock accepted monographs, or manage your practice filing with
              the council.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/20 pt-5">
              {[
                ["280+", "Verified studios"],
                ["₦42.8B", "Monitored capital"],
                ["100%", "Licence checks"],
              ].map(([value, label]) => (
                <div key={label}>
                  <p className="font-serif text-headline-sm tnum">{value}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-white/50">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-body-sm text-white/45">
            Statutory records maintained under the Architects Registration Council of Nigeria Act CAP A19 LFN 2004.
          </p>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 md:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-2 font-serif text-headline-sm text-ink lg:invisible">
            ArchNG<span className="text-terracotta">.</span>
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-body-sm text-stone hover:text-ink">
            Back to public site
            <Icon name="arrow_outward" className="text-[15px]" />
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 md:px-8 lg:px-10">
          <div className="w-full max-w-md">
            <Eyebrow>{isRegister ? "Create an account" : "Client & practitioner access"}</Eyebrow>
            <h2 className="mt-3 font-serif text-headline-xl text-ink">
              {isRegister ? "Join the registry" : "Welcome back"}
            </h2>
            <p className="mt-2 text-body text-stone">
              {isRegister
                ? "Register as a client to track commissions, or apply as an architect for council verification."
                : "Access your requests, saved monographs, or practice workspace."}
            </p>

            <div className="mt-6 flex rounded-lg border border-hairline bg-surface-low p-1">
              {[
                { id: "signin", label: "Sign in" },
                { id: "register", label: "Create account" },
              ].map((tab) => {
                const active = (tab.id === "signin") !== isRegister;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => switchMode(tab.id as "signin" | "register")}
                    className={cn(
                      "flex-1 rounded-md px-4 py-2 text-label transition-colors",
                      active ? "bg-card text-ink shadow-sm" : "text-stone hover:text-ink",
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              {isRegister && (
                <Field label="Full name" required>
                  <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Adaeze Okafor" />
                </Field>
              )}
              <Field label="Email address" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@studio.ng"
                />
              </Field>
              <Field label="Password" hint="8+ characters" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                />
              </Field>
              {isRegister && (
                <Field label="Account type" required>
                  <Select value={role} onChange={(event) => setRole(event.target.value as Role)}>
                    <option value="client">Client — commission a practice</option>
                    <option value="architect">Architect — manage a practice</option>
                  </Select>
                </Field>
              )}
              {isRegister && role === "architect" && (
                <>
                  <Field label="Registered practice name" required>
                    <Input value={firm} onChange={(event) => setFirm(event.target.value)} placeholder="Okafor Studio" />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="City">
                      <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Lagos" />
                    </Field>
                    <Field label="State">
                      <Input value={state} onChange={(event) => setState(event.target.value)} placeholder="Lagos" />
                    </Field>
                  </div>
                </>
              )}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-body-sm text-danger">
                  <Icon name="error" className="text-[18px]" />
                  {error}
                </div>
              )}
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
                <Icon name="arrow_forward" className="text-[17px]" />
              </Button>
            </form>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-stone-soft">
              By continuing you agree to the registry's statutory terms and client safeguards. This is a prototype
              environment — use any valid-looking details.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-body-sm text-stone lg:hidden">
              <span>{isRegister ? "Already registered?" : "New to ArchNG?"}</span>
              <button
                type="button"
                onClick={() => switchMode(isRegister ? "signin" : "register")}
                className="text-terracotta hover:underline"
              >
                {isRegister ? "Sign in" : "Create an account"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
