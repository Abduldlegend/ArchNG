import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/context";
import type { Architect } from "../data";
import { PageHeader } from "../components/layout";
import { cn } from "../lib/cn";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Field,
  Icon,
  LinkButton,
  Select,
  Textarea,
  VerifiedBadge,
} from "../components/ui";

const projectTypes = [
  "Private Residence",
  "Civic / Institutional",
  "Hospitality",
  "Cultural",
  "Commercial",
  "Adaptive Reuse",
];
const states = ["Lagos", "Abuja FCT", "Rivers", "Oyo", "Enugu", "Osun", "Kano", "Cross River"];
const budgets = [
  { value: "5M_20M", label: "₦5m – ₦20m" },
  { value: "20M_50M", label: "₦20m – ₦50m" },
  { value: "50M_250M", label: "₦50m – ₦250m" },
  { value: "ABOVE_250M", label: "₦250m+" },
];
const slots = [
  { day: "Tue 17 Feb", times: ["09:00", "11:30"] },
  { day: "Wed 18 Feb", times: ["10:00", "14:00"] },
  { day: "Thu 19 Feb", times: ["09:30", "16:30"] },
];

export default function RequestDemo() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getArchitect, loadArchitect, addRequest, notify, signedIn } = useApp();
  const [architect, setArchitect] = useState<Architect | undefined>(() => getArchitect(slug));
  const [loading, setLoading] = useState(true);

  const [projectType, setProjectType] = useState("");
  const [state, setState] = useState("");
  const [budget, setBudget] = useState("");
  const [brief, setBrief] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const budgetLabel = budgets.find((item) => item.value === budget)?.label ?? "";

  useEffect(() => {
    let active = true;
    setArchitect(getArchitect(slug));
    setLoading(true);
    void loadArchitect(slug).then((result) => {
      if (!active) return;
      if (result) setArchitect(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!architect && loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-terracotta" />
        <p className="mt-4 text-body-sm text-stone">Opening the practice record.</p>
      </div>
    );
  }

  if (!architect) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon="architecture"
          title="Practice not found"
          description="The practice you are trying to contact is not currently listed in the registry."
          action={<LinkButton to="/architects">Browse the directory</LinkButton>}
        />
      </div>
    );
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!signedIn) {
      navigate(`/signin?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!projectType || !state || !budget) {
      setError("Select a project typology, state, and budget band.");
      return;
    }
    if (brief.trim().length < 40) {
      setError("Please describe the brief in at least 40 characters.");
      return;
    }
    if (!slot) {
      setError("Choose a preferred video consultation slot.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const id = await addRequest({
        architectSlug: architect.slug,
        projectType,
        state,
        budgetRange: budget,
        brief: `${brief.trim()}\n\nPreferred consultation slot: ${slot}`,
      });
      setSubmittedId(id);
      notify("Commission request submitted. The studio has 72 hours to respond.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit this request. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <>
        <PageHeader
          eyebrow="Request received"
          title="Your brief is with the studio"
          description="The practice has 72 hours to accept or decline. You can track the request from your client portal."
        />
        <section className="py-10 md:py-14">
          <div className="container-page max-w-2xl">
            <Card className="overflow-hidden">
              <div className="flex items-center gap-4 border-b border-hairline bg-verified-soft px-6 py-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-verified text-white">
                  <Icon name="check" className="text-[24px]" />
                </span>
                <div>
                  <p className="text-label text-verified">Commission request submitted</p>
                  <p className="text-body-sm text-verified/80">
                    Reference <span className="tnum">{submittedId.toUpperCase()}</span> · 72-hour response window
                  </p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={architect.portrait}
                    alt={architect.name}
                    className="h-14 w-14 rounded-lg border border-hairline object-cover"
                  />
                  <div>
                    <p className="font-serif text-headline-sm text-ink">{architect.firm}</p>
                    <p className="text-body-sm text-stone">
                      {projectType} · {state} · {budgetLabel}
                    </p>
                  </div>
                  <Badge tone="warning" className="ml-auto">
                    Requested
                  </Badge>
                </div>
                <p className="mt-5 rounded-lg bg-surface-low p-4 text-body-sm text-stone">{brief}</p>
                <div className="mt-5 flex items-center gap-2 rounded-lg border border-hairline px-4 py-3 text-body-sm text-stone">
                  <Icon name="event" className="text-[18px] text-terracotta" />
                  Preferred slot <strong className="font-medium text-ink">{slot}</strong>
                </div>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  <LinkButton to="/requests">
                    Track this request
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </LinkButton>
                  <LinkButton to="/architects" variant="secondary">
                    Continue browsing
                  </LinkButton>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Request a video demo"
        title="Submit your commission brief"
        description="A structured brief helps the studio decide quickly. Accepted requests unlock the full technical walkthrough and direct contact desk."
        action={<Badge tone="verified">No payment required</Badge>}
      />

      <section className="py-10 md:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={submit}>
            <Card className="p-5 md:p-7">
              <div className="flex items-center gap-2">
                <span className="text-caps uppercase tracking-[0.09em] text-stone-soft">Step 1</span>
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-caps uppercase tracking-[0.09em] text-stone-soft">Project brief</span>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Project typology" required>
                  <Select value={projectType} onChange={(event) => setProjectType(event.target.value)}>
                    <option value="">Select typology</option>
                    {projectTypes.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Nigerian state" required>
                  <Select value={state} onChange={(event) => setState(event.target.value)}>
                    <option value="">Select state</option>
                    {states.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-caps uppercase tracking-[0.09em] text-stone-soft">
                  Escrow-verified budget band <span className="text-terracotta">*</span>
                </span>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {budgets.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBudget(option.value)}
                      className={cn(
                        "min-h-11 rounded-lg border px-3 py-2 text-body-sm transition-colors tnum",
                        budget === option.value
                          ? "border-ink bg-ink text-white"
                          : "border-hairline-strong bg-card text-stone hover:border-ink hover:text-ink",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <Field
                label="Commission brief"
                hint={`${brief.length}/600`}
                className="mt-5"
                required
              >
                <Textarea
                  value={brief}
                  maxLength={600}
                  onChange={(event) => setBrief(event.target.value)}
                  placeholder="Describe the site, scope, timeline, and any material or sustainability preferences..."
                />
              </Field>

              <div className="mt-7 flex items-center gap-2">
                <span className="text-caps uppercase tracking-[0.09em] text-stone-soft">Step 2</span>
                <span className="h-px flex-1 bg-hairline" />
                <span className="text-caps uppercase tracking-[0.09em] text-stone-soft">Preferred call</span>
              </div>

              <div className="mt-4 space-y-3">
                {slots.map((day) => (
                  <div key={day.day} className="rounded-lg border border-hairline bg-surface-low p-3">
                    <p className="mb-2 text-label text-ink">{day.day}</p>
                    <div className="flex flex-wrap gap-2">
                      {day.times.map((time) => {
                        const value = `${day.day} · ${time}`;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSlot(value)}
                            className={cn(
                              "min-h-10 rounded-lg border px-4 text-body-sm tnum transition-colors",
                              slot === value
                                ? "border-terracotta bg-terracotta text-white"
                                : "border-hairline-strong bg-card text-stone hover:border-ink hover:text-ink",
                            )}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-body-sm text-danger">
                  <Icon name="error" className="text-[18px]" />
                  {error}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 border-t border-hairline pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-[11px] leading-relaxed text-stone-soft">
                  Your brief is shared only with the selected studio and the council's statutory records.
                </p>
                <Button type="submit" size="lg" disabled={submitting}>
                  {submitting ? "Submitting brief…" : "Submit commission request"}
                  <Icon name="send" className="text-[17px]" />
                </Button>
              </div>
            </Card>
          </form>

          <aside>
            <Card className="lg:sticky lg:top-24">
              <div className="border-b border-hairline p-5">
                <Eyebrow>Selected practice</Eyebrow>
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={architect.portrait}
                    alt={architect.name}
                    className="h-14 w-14 rounded-lg border border-hairline object-cover"
                  />
                  <div>
                    <p className="font-serif text-headline-sm text-ink">{architect.firm}</p>
                    <p className="text-body-sm text-stone">{architect.city}</p>
                  </div>
                </div>
                <VerifiedBadge className="mt-3" />
              </div>
              <dl className="space-y-3 p-5 text-body-sm">
                {[
                  ["Principal", architect.name],
                  ["ARCON", architect.arcon.replace("ARCON ", "")],
                  ["Experience", `${architect.years} years`],
                  ["Commission tier", architect.feeTier],
                  ["Response window", "72 hours"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-hairline pb-2 last:border-0 last:pb-0">
                    <dt className="text-stone">{label}</dt>
                    <dd className="text-right text-ink tnum">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="border-t border-hairline p-5">
                <p className="flex items-start gap-2 text-body-sm text-stone">
                  <Icon name="lock" className="mt-0.5 text-[17px] text-verified" />
                  Contact details and the technical walkthrough unlock only after the studio accepts your request.
                </p>
                <Link to={`/architects/${architect.slug}`} className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-terracotta hover:underline">
                  Review the monograph first
                  <Icon name="arrow_outward" className="text-[15px]" />
                </Link>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
