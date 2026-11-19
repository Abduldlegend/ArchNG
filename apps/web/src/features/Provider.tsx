import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/context";
import { projectApi, uploadApi } from "../lib/api";
import { PageHeader } from "../components/layout";
import { LeadCard } from "../components/cards";
import { cn } from "../lib/cn";
import {
  Badge,
  Button,
  Card,
  Chip,
  EmptyState,
  Eyebrow,
  Field,
  Icon,
  Input,
  LinkButton,
  ProgressBar,
  Select,
  Tabs,
  Textarea,
  VerifiedBadge,
} from "../components/ui";

function Sparkline({ points, tone = "terracotta" }: { points: string; tone?: "terracotta" | "verified" }) {
  return (
    <svg viewBox="0 0 100 32" className="h-8 w-24" aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={tone === "terracotta" ? "var(--color-terracotta)" : "var(--color-verified)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ProviderDashboard() {
  const { user, providerProfile, providerStats, leads, notify } = useApp();
  const architect = providerProfile;
  const works = providerProfile?.projects ?? [];
  const pendingLeads = leads.filter((lead) => lead.status === "Pending");
  const verified = architect?.verificationStatus === "VERIFIED";

  const metrics = [
    { label: "Profile views", value: (providerStats?.profileViews ?? 0).toLocaleString("en-NG"), delta: "Live views", points: "0,26 14,22 28,24 42,14 56,18 70,10 84,13 100,5" },
    { label: "Published works", value: String(providerStats?.projects.published ?? 0), delta: `${providerStats?.projects.drafts ?? 0} draft plates`, points: "0,24 14,20 28,21 42,16 56,18 70,14 84,10 100,8" },
    { label: "New requests", value: String(providerStats?.leads.pending ?? 0), delta: `${providerStats?.leads.accepted ?? 0} accepted`, points: "0,28 14,24 28,25 42,20 56,22 70,16 84,18 100,10" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Practice workspace"
        title={`Good morning, ${user?.name?.split(" ")[0] ?? "architect"}.`}
        description="Your practice record, active monographs, and new commission briefs in one place."
        action={
          <div className="flex items-center gap-3">
            <Badge tone={verified ? "verified" : "warning"}>
              <Icon name={verified ? "check_circle" : "pending"} className="text-[14px]" />
              {verified ? "Verified practice" : "Verification in review"}
            </Badge>
            <LinkButton to="/provider/profile" variant="secondary" size="sm">
              Edit profile
            </LinkButton>
          </div>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <div className={cn(
          "flex flex-wrap items-center justify-between gap-4 rounded-lg border px-5 py-4",
          verified ? "border-verified/25 bg-verified-soft" : "border-warning/25 bg-warning-soft",
        )}>
          <div className="flex items-start gap-3">
            <Icon name={verified ? "verified" : "warning"} className={cn("mt-0.5 text-[20px]", verified ? "text-verified" : "text-warning")} />
            <div>
              <p className={cn("text-label", verified ? "text-verified" : "text-warning")}>
                {verified ? "ARCON verification is current" : "ARCON verification is not complete"}
              </p>
              <p className={cn("text-body-sm", verified ? "text-verified/80" : "text-warning/80")}>
                {verified
                  ? "Your public practice record and published projects are visible in the directory."
                  : "Publish and unlock gated project details once the council verifies your filing."}
              </p>
            </div>
          </div>
          <Link to="/provider/profile#verification" className={cn("text-body-sm underline-offset-4 hover:underline", verified ? "text-verified" : "text-warning")}>
            View filing
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="text-caps uppercase tracking-[0.07em] text-stone-soft">{metric.label}</span>
                <Sparkline points={metric.points} tone={metric.label === "New requests" ? "verified" : "terracotta"} />
              </div>
              <p className="mt-2 font-serif text-headline-lg text-ink tnum">{metric.value}</p>
              <p className="mt-1 text-body-sm text-verified">{metric.delta}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Eyebrow>Practice record</Eyebrow>
                  <h2 className="mt-2 font-serif text-headline-sm text-ink">Profile completeness</h2>
                </div>
                <span className="font-serif text-headline-sm text-terracotta tnum">{providerStats?.profileCompletion ?? 0}%</span>
              </div>
              <ProgressBar value={providerStats?.profileCompletion ?? 0} className="mt-4" />
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Practice basics", Boolean(architect?.firm && architect?.bio)],
                  ["Contact desk", Boolean(architect?.contact?.email)],
                  ["Typologies & focus", Boolean(architect?.specialties?.length)],
                  ["Demo walkthrough", Boolean(providerStats?.demoAvailable)],
                ].map(([label, done]) => (
                  <li key={String(label)} className="flex items-center gap-2 text-body-sm">
                    <Icon
                      name={done ? "check_circle" : "radio_button_unchecked"}
                      filled={Boolean(done)}
                      className={cn("text-[18px]", done ? "text-verified" : "text-stone-soft")}
                    />
                    <span className={done ? "text-ink" : "text-stone"}>{label}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                <LinkButton to="/provider/profile" size="sm">
                  Complete profile
                  <Icon name="arrow_forward" className="text-[15px]" />
                </LinkButton>
                <LinkButton
                  to={architect?.slug ? `/architects/${architect.slug}` : "/provider/profile"}
                  variant="secondary"
                  size="sm"
                >
                  View public page
                </LinkButton>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                <div>
                  <Eyebrow>Monograph exhibits</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Published works</h2>
                </div>
                <Link
                  to={works[0] ? `/provider/projects/${works[0].id}/edit` : "/provider/profile"}
                  className="text-body-sm text-terracotta hover:underline"
                >
                  Manage
                </Link>
              </div>
              <div className="divide-y divide-hairline">
                {works.length > 0 ? works.map((project, index) => (
                  <div key={project.id} className="flex items-center gap-4 px-5 py-4">
                    <img
                      src={project.cover}
                      alt={project.title}
                      className="h-14 w-20 rounded-lg border border-hairline object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-label text-ink">{project.title}</p>
                      <p className="text-body-sm text-stone">
                        {project.city} · {project.year}
                      </p>
                    </div>
                    <Badge tone={index === 0 ? "verified" : "neutral"}>{index === 0 ? "Published" : "Published"}</Badge>
                    <Link
                      to={`/projects/${project.slug}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:bg-surface-low hover:text-ink"
                      aria-label={`View ${project.title}`}
                    >
                      <Icon name="arrow_outward" className="text-[17px]" />
                    </Link>
                  </div>
                )) : (
                  <div className="px-5 py-8">
                    <EmptyState
                      icon="image"
                      title="No published works yet"
                      description="Add a monograph plate, then publish it after verification."
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                <div>
                  <Eyebrow>Leads inbox</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Awaiting your decision</h2>
                </div>
                <Badge tone="warning">{pendingLeads.length} pending</Badge>
              </div>
              <div className="divide-y divide-hairline">
                {pendingLeads.slice(0, 2).map((lead) => (
                  <div key={lead.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-label text-ink">{lead.client}</p>
                      <p className="text-body-sm text-stone">
                        {lead.projectType} · {lead.budget}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone="danger">{lead.deadline}</Badge>
                      <Link to="/provider/leads" className="text-body-sm text-terracotta hover:underline">
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <Eyebrow>Practice summary</Eyebrow>
              <p className="mt-2 font-serif text-headline-sm text-ink">{architect?.firm}</p>
              <VerifiedBadge className="mt-2" />
              <dl className="mt-4 space-y-2.5 text-body-sm">
                {[
                  ["ARCON", architect?.registrationNumber ?? architect?.arcon ?? "Pending"],
                  ["Chapter", architect?.state ?? "—"],
                  ["Years", `${architect?.years ?? 0} years`],
                  ["Built works", String(architect?.works ?? 0)],
                  ["Commission tier", architect?.feeTier ?? "—"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-hairline pb-2 last:border-0 last:pb-0">
                    <dt className="text-stone">{label}</dt>
                    <dd className="text-ink tnum">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card className="p-5">
              <Eyebrow>Response performance</Eyebrow>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="font-serif text-headline-md text-ink tnum">{providerStats?.leads.accepted ?? 0}</p>
                  <p className="text-body-sm text-stone">Accepted briefs</p>
                </div>
                <div>
                  <p className="font-serif text-headline-md text-ink tnum">{providerStats?.leads.pending ?? 0}</p>
                  <p className="text-body-sm text-stone">Awaiting decision</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-surface-low p-3 text-body-sm text-stone">
                <Icon name="info" className="mr-1 text-[16px] text-terracotta" />
                The council recommends responding within the 48-hour window to maintain verified status.
              </div>
            </Card>

            <Card className="p-5">
              <Eyebrow>Registry support</Eyebrow>
              <p className="mt-2 text-body-sm text-stone">
                Need help with a Form B filing or practice record update?
              </p>
              <Button variant="secondary" className="mt-4 w-full" onClick={() => notify("Support ticket opened with the ARCON registry desk.")}>
                <Icon name="support_agent" className="text-[17px]" />
                Contact registry desk
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export function ProfileEditor() {
  const { user, providerProfile, providerStats, updateProviderProfile, notify } = useApp();
  const [firm, setFirm] = useState("");
  const [principal, setPrincipal] = useState("");
  const [arcon, setArcon] = useState("");
  const [chapter, setChapter] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [years, setYears] = useState("0");
  const [focus, setFocus] = useState<string[]>([]);
  const [showEmail, setShowEmail] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [acceptingLeads, setAcceptingLeads] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = providerProfile;
    setFirm(profile?.firm ?? "");
    setPrincipal(user?.name ?? profile?.name ?? "");
    setArcon(profile?.registrationNumber ?? profile?.arcon ?? "");
    setChapter(profile?.state ?? "");
    setCity(profile?.city ?? "");
    setEmail(profile?.contact?.email ?? "");
    setPhone(profile?.contact?.phone ?? "");
    setWhatsapp(profile?.contact?.whatsapp ?? "");
    setWebsite(profile?.contact?.website ?? "");
    setBio(profile?.bio ?? "");
    setDemoUrl(profile?.video?.url ?? "");
    setYears(String(profile?.years ?? 0));
    setFocus(profile?.specialties ?? []);
    setAcceptingLeads(profile?.acceptingLeads ?? true);
  }, [providerProfile, user?.name]);

  const toggleFocus = (value: string) => {
    setFocus((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await updateProviderProfile({
        firm,
        city,
        state: chapter,
        bio,
        registrationNumber: arcon,
        contactEmail: email,
        contactPhone: phone,
        whatsapp,
        website,
        demoVideoUrl: demoUrl,
        yearsExperience: Number(years) || 0,
        specialties: focus,
        showEmailToAccepted: showEmail,
        showPhoneToAccepted: showPhone,
        acceptingLeads,
      });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile editor"
        title="Practice accreditation & contact"
        description="Keep your registered practice record, public monograph, and contact desk current."
        action={
          <div className="flex items-center gap-3">
            <Badge>Profile completeness {providerStats?.profileCompletion ?? 0}%</Badge>
            <LinkButton
              to={providerProfile?.slug ? `/architects/${providerProfile.slug}` : "/provider"}
              variant="secondary"
              size="sm"
            >
              Preview public page
            </LinkButton>
          </div>
        }
      />

      <div className="container-page grid gap-8 py-8 md:py-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1 border-l border-hairline pl-4">
            {[
              ["Practice basics", "#basics"],
              ["Contact & privacy", "#contact"],
              ["Typologies & focus", "#focus"],
              ["Work milestones", "#milestones"],
              ["Demo video", "#demo"],
              ["Verification", "#verification"],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "block py-1.5 text-body-sm transition-colors",
                  index === 0 ? "text-ink" : "text-stone hover:text-ink",
                )}
              >
                <span className="mr-2 text-caps tnum text-stone-soft">0{index + 1}</span>
                {label}
              </a>
            ))}
          </div>
        </aside>

        <form onSubmit={save} className="space-y-6">
          <Card className="scroll-mt-24 p-5 md:p-6" >
            <div id="basics" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <Eyebrow>Section 01</Eyebrow>
                <h2 className="mt-1 font-serif text-headline-sm text-ink">Practice basics</h2>
              </div>
              <Badge tone="verified">Licence current</Badge>
            </div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Registered firm name" required>
                <Input value={firm} onChange={(event) => setFirm(event.target.value)} />
              </Field>
              <Field label="Principal architect" hint="Managed by your account name">
                <Input value={principal} disabled />
              </Field>
              <Field label="ARCON registration number" required>
                <Input value={arcon} onChange={(event) => setArcon(event.target.value)} />
              </Field>
              <Field label="Chapter / state">
                <Input value={chapter} onChange={(event) => setChapter(event.target.value)} />
              </Field>
              <Field label="City">
                <Input value={city} onChange={(event) => setCity(event.target.value)} />
              </Field>
              <Field label="Years in practice">
                <Input
                  value={years}
                  onChange={(event) => setYears(event.target.value)}
                  inputMode="numeric"
                  className="tnum"
                />
              </Field>
              <Field label="Studio biography" className="sm:col-span-2">
                <Textarea value={bio} onChange={(event) => setBio(event.target.value)} />
              </Field>
            </div>
          </Card>

          <Card className="scroll-mt-24 p-5 md:p-6">
            <div id="contact" />
            <Eyebrow>Section 02</Eyebrow>
            <h2 className="mt-1 font-serif text-headline-sm text-ink">Contact desk &amp; privacy</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Studio email" required>
                <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </Field>
              <Field label="Studio line">
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </Field>
              <Field label="WhatsApp">
                <Input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} />
              </Field>
              <Field label="Website">
                <Input value={website} onChange={(event) => setWebsite(event.target.value)} />
              </Field>
            </div>
            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-low px-4 py-3">
                <span className="text-body-sm text-ink">Show studio email to accepted clients</span>
                <input
                  type="checkbox"
                  checked={showEmail}
                  onChange={(event) => setShowEmail(event.target.checked)}
                  className="h-4 w-4 accent-terracotta"
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-low px-4 py-3">
                <span className="text-body-sm text-ink">Show direct mobile to accepted clients</span>
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={(event) => setShowPhone(event.target.checked)}
                  className="h-4 w-4 accent-terracotta"
                />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-low px-4 py-3">
                <span className="text-body-sm text-ink">Accept new commission briefs</span>
                <input
                  type="checkbox"
                  checked={acceptingLeads}
                  onChange={(event) => setAcceptingLeads(event.target.checked)}
                  className="h-4 w-4 accent-terracotta"
                />
              </label>
            </div>
          </Card>

          <Card className="scroll-mt-24 p-5 md:p-6">
            <div id="focus" />
            <Eyebrow>Section 03</Eyebrow>
            <h2 className="mt-1 font-serif text-headline-sm text-ink">Typologies &amp; focus areas</h2>
            <p className="mt-2 text-body-sm text-stone">Select the specialisms that appear on your public monograph.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
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
              ].map((item) => (
                <Chip key={item} active={focus.includes(item)} onClick={() => toggleFocus(item)}>
                  {item}
                </Chip>
              ))}
            </div>
          </Card>

          <Card className="scroll-mt-24 p-5 md:p-6">
            <div id="milestones" />
            <Eyebrow>Section 04</Eyebrow>
            <h2 className="mt-1 font-serif text-headline-sm text-ink">Work milestones</h2>
            <div className="mt-5 space-y-3">
              {(providerProfile?.experiences ?? []).length > 0 ? (
                (providerProfile?.experiences ?? []).map((experience) => (
                  <div key={experience.id} className="flex gap-4 rounded-lg border border-hairline p-4">
                    <span className="font-serif text-headline-sm text-terracotta tnum">{experience.year}</span>
                    <div className="flex-1">
                      <p className="text-label text-ink">{experience.title}</p>
                      <p className="text-body-sm text-stone">
                        {experience.organisation}
                        {experience.description ? ` · ${experience.description}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-hairline bg-surface-low px-4 py-6 text-body-sm text-stone">
                  No work milestones have been added to this practice record yet.
                </p>
              )}
            </div>
          </Card>

          <Card className="scroll-mt-24 p-5 md:p-6">
            <div id="demo" />
            <Eyebrow>Section 05</Eyebrow>
            <h2 className="mt-1 font-serif text-headline-sm text-ink">Technical demo walkthrough</h2>
            <p className="mt-2 text-body-sm text-stone">
              Accepted clients unlock this 21-minute video. It sits behind the approval gate.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="relative overflow-hidden rounded-lg border border-hairline">
                <img src={IMG_VIDEO} alt="" className="aspect-video h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/35 text-white">
                  <Icon name="play_circle" className="text-[30px]" />
                </span>
              </div>
              <div className="space-y-4">
                <Field label="Walkthrough URL" hint="Vimeo or YouTube">
                  <Input value={demoUrl} onChange={(event) => setDemoUrl(event.target.value)} />
                </Field>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      try {
                        new URL(demoUrl);
                        notify("Video link looks valid. Save the profile to publish it.");
                      } catch {
                        notify("Enter a valid Vimeo or YouTube URL.");
                      }
                    }}
                  >
                    Validate link
                  </Button>
                  <Badge tone={providerProfile?.video?.available ? "verified" : "neutral"}>
                    <Icon name={providerProfile?.video?.available ? "check_circle" : "link_off"} className="text-[14px]" />
                    {providerProfile?.video?.available ? "Published" : "Not published"}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="scroll-mt-24 p-5 md:p-6">
            <div id="verification" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Eyebrow>Section 06</Eyebrow>
                <h2 className="mt-1 font-serif text-headline-sm text-ink">ARCON verification</h2>
              </div>
              <Badge tone={providerProfile?.verificationStatus === "VERIFIED" ? "verified" : "warning"}>
                {providerProfile?.verificationStatus === "VERIFIED"
                  ? "Verified"
                  : providerProfile?.verificationStatus === "REJECTED"
                    ? "Rejected"
                    : "In review"}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(providerProfile?.verificationDocuments ?? []).length > 0 ? (
                providerProfile?.verificationDocuments?.map((document) => (
                  <a
                    key={document.id}
                    href={document.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-hairline bg-surface-low p-4 transition-colors hover:border-ink"
                  >
                    <p className="flex items-center gap-2 text-body-sm text-ink">
                      <Icon name="description" className="text-[17px] text-stone" />
                      {document.name}
                    </p>
                    <p className="mt-1 pl-7 text-body-sm text-stone">
                      {document.status} · {document.uploadedAt}
                    </p>
                  </a>
                ))
              ) : (
                <p className="rounded-lg border border-hairline bg-surface-low p-4 text-body-sm text-stone sm:col-span-2">
                  No verification documents have been uploaded yet.
                </p>
              )}
            </div>
            {providerProfile?.verificationNote && (
              <p className="mt-3 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-body-sm text-warning">
                {providerProfile.verificationNote}
              </p>
            )}
          </Card>

          {error && (
            <p className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-body-sm text-danger">
              {error}
            </p>
          )}
          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-lg border border-hairline bg-card/95 p-3 shadow-lift backdrop-blur md:bottom-6">
            <p className="hidden text-body-sm text-stone sm:block">
              Saving updates your public practice record.
            </p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button type="submit" className="flex-1 sm:flex-none" disabled={saving}>
                {saving ? "Saving…" : "Publish changes"}
                <Icon name="check" className="text-[17px]" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

const IMG_VIDEO = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80";

export function ProjectEditor() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { providerProfile, notify, refreshProvider } = useApp();
  const [project, setProject] = useState(() =>
    providerProfile?.projects?.find((item) => item.id === id || item.slug === id),
  );
  const [loading, setLoading] = useState(!project);
  const [status, setStatus] = useState("PUBLISHED");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [typology, setTypology] = useState("");
  const [city, setCity] = useState("");
  const [year, setYear] = useState("");
  const [gfa, setGfa] = useState("");
  const [budget, setBudget] = useState("");
  const [structural, setStructural] = useState("");
  const [climate, setClimate] = useState("");
  const [summary, setSummary] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({
    "ARCON registration verified": true,
    "Client consent for images": true,
    "Technical data authenticated": true,
    "Structural engineer sign-off": false,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const cached = providerProfile?.projects?.find((item) => item.id === id || item.slug === id);
    if (cached) {
      setProject(cached);
      setLoading(false);
      return;
    }
    setLoading(true);
    void projectApi
      .mine(id)
      .catch(() => projectApi.mineList({ pageSize: 50 }).then(({ items }) => items.find((item) => item.id === id || item.slug === id)))
      .then((result) => {
        if (!active) return;
        if (result) setProject(result);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load this project.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!project) return;
    setStatus(project.status ?? "PUBLISHED");
    setTitle(project.title);
    setTypology(project.typology);
    setCity(project.city);
    setYear(project.year);
    setGfa(project.gfa);
    setBudget(String(project.budget));
    setStructural(project.structural);
    setClimate(project.climate);
    setSummary(project.summary);
  }, [project]);

  const saveProject = async () => {
    if (!project) return;
    if (status === "PUBLISHED" && !checks["Structural engineer sign-off"]) {
      setError("Structural sign-off is required before publishing.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const updated = await projectApi.update(project.id, {
        title,
        typology,
        city,
        year: Number(year),
        gfa,
        budget: Number(budget),
        structural,
        climate,
        summary,
        status,
      });
      setProject(updated);
      notify("Project saved.");
      void refreshProvider();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this project.");
    } finally {
      setSaving(false);
    }
  };

  const uploadPlate = async (file: File) => {
    if (!project) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadApi.upload(file, "projects");
      const existing = project.images ?? [];
      const updated = await projectApi.update(project.id, {
        images: [
          ...existing.map((image) => ({
            id: image.id,
            url: image.url,
            publicId: image.publicId ?? undefined,
            kind: image.kind,
            alt: image.alt ?? undefined,
            isCover: image.isCover,
            order: image.order,
            plateLabel: image.plateLabel ?? undefined,
            plateTitle: image.plateTitle ?? undefined,
            plateYear: image.plateYear ?? undefined,
            plateScale: image.plateScale ?? undefined,
          })),
          {
            url,
            kind: "PHOTO",
            alt: title,
            isCover: existing.length === 0,
            order: existing.length,
          },
        ],
      });
      setProject(updated);
      notify("Plate uploaded.");
      void refreshProvider();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (!project) {
    if (loading) {
      return (
        <div className="container-page py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-terracotta" />
          <p className="mt-4 text-body-sm text-stone">Opening the project plate.</p>
        </div>
      );
    }
    return (
      <div className="container-page py-20">
        <EmptyState icon="search_off" title="Project not found" description={error || "This project is not part of your practice record."} />
      </div>
    );
  }
  const architect = providerProfile;

  return (
    <>
      <div className="border-b border-hairline bg-surface-low/60">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-body-sm text-stone">
          <div className="flex items-center gap-2">
            <Link to="/provider" className="hover:text-terracotta">
              Projects
            </Link>
            <Icon name="chevron_right" className="text-[15px]" />
            <span className="text-ink">{project.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-9 rounded-lg border border-hairline-strong bg-card px-3 text-body-sm text-ink"
              aria-label="Publication status"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="HIDDEN">Hidden</option>
            </select>
            <Button size="sm" onClick={() => void saveProject()} disabled={saving}>
              {saving ? "Saving…" : "Save plate"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page py-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Eyebrow>Monograph editor</Eyebrow>
            <h1 className="mt-2 font-serif text-headline-lg text-ink">{project.title}</h1>
            <p className="mt-1 text-body-sm text-stone">
              {architect?.firm} · {project.city} · {project.year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={status === "PUBLISHED" ? "verified" : "warning"}>
              {status === "PUBLISHED" ? "Published" : status === "DRAFT" ? "Draft" : "Hidden"}
            </Badge>
            <LinkButton to={`/projects/${project.slug}`} variant="secondary" size="sm">
              Preview
              <Icon name="open_in_new" className="text-[15px]" />
            </LinkButton>
          </div>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-body-sm text-danger">
            {error}
          </p>
        )}

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>Plate uploader</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Archival drawings &amp; photography</h2>
                </div>
                <Button size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  <Icon name="upload" className="text-[16px]" />
                  {uploading ? "Uploading…" : "Upload plate"}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadPlate(file);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-surface-low px-6 py-10 text-center transition-colors hover:border-ink disabled:opacity-60"
              >
                <Icon name="cloud_upload" className="text-[28px] text-stone" />
                <span className="mt-3 text-label text-ink">Drop drawings here or select a file</span>
                <span className="mt-1 text-body-sm text-stone">JPG, PNG, WEBP, or AVIF — up to 20MB per plate</span>
              </button>
              {uploading && (
                <div className="mt-4">
                  <ProgressBar value={65} className="mt-2" />
                  <p className="mt-1 text-body-sm text-stone">Uploading your plate…</p>
                </div>
              )}
              <div className="mt-5 space-y-2">
                {project.plates.map((plate) => (
                  <div key={plate.label} className="flex items-center gap-3 rounded-lg border border-hairline px-4 py-3">
                    <Icon name="image" className="text-[18px] text-stone" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm text-ink">{plate.title}</p>
                      <p className="text-[11px] text-stone tnum">
                        {plate.label} · {plate.scale}
                      </p>
                    </div>
                    <Badge tone="verified">Ready</Badge>
                    <button type="button" className="text-stone hover:text-danger" aria-label={`Remove ${plate.title}`}>
                      <Icon name="delete" className="text-[17px]" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <Eyebrow>Technical attributes</Eyebrow>
              <h2 className="mt-1 font-serif text-headline-sm text-ink">Project specifications</h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Project title">
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                </Field>
                <Field label="Typology">
                  <Select value={typology} onChange={(event) => setTypology(event.target.value)}>
                    {["Private Residence", "Civic / Institutional", "Hospitality", "Cultural", "Commercial"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Location">
                  <Input value={city} onChange={(event) => setCity(event.target.value)} />
                </Field>
                <Field label="Completion year">
                  <Input value={year} onChange={(event) => setYear(event.target.value)} />
                </Field>
                <Field label="Gross floor area">
                  <Input value={gfa} onChange={(event) => setGfa(event.target.value)} />
                </Field>
                <Field label="Construction scale (₦)">
                  <Input value={budget} onChange={(event) => setBudget(event.target.value)} className="tnum" inputMode="numeric" />
                </Field>
                <Field label="Structural system" className="sm:col-span-2">
                  <Input value={structural} onChange={(event) => setStructural(event.target.value)} />
                </Field>
                <Field label="Climate strategy" className="sm:col-span-2">
                  <Input value={climate} onChange={(event) => setClimate(event.target.value)} />
                </Field>
                <Field label="Monograph summary" className="sm:col-span-2">
                  <Textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
                </Field>
              </div>
              <div className="mt-5 flex justify-end gap-2 border-t border-hairline pt-5">
                <Button variant="secondary" onClick={() => navigate("/provider")}>
                  Cancel
                </Button>
                <Button onClick={() => void saveProject()} disabled={saving}>
                  {saving ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <Eyebrow>Publication</Eyebrow>
              <div className="mt-4 space-y-3">
                {[
                  { value: "PUBLISHED", label: "Published", note: "Visible to everyone in the public archive." },
                  { value: "DRAFT", label: "Draft", note: "Only visible to your practice." },
                  { value: "HIDDEN", label: "Hidden", note: "Temporarily removed from the archive." },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3",
                      status === option.value ? "border-ink bg-surface-low" : "border-hairline",
                    )}
                  >
                    <span>
                      <span className="block text-label text-ink">{option.label}</span>
                      <span className="block text-body-sm text-stone">{option.note}</span>
                    </span>
                    <input
                      type="radio"
                      name="status"
                      checked={status === option.value}
                      onChange={() => setStatus(option.value)}
                      className="h-4 w-4 accent-terracotta"
                    />
                  </label>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <Eyebrow>ARCON compliance</Eyebrow>
              <h2 className="mt-1 font-serif text-headline-sm text-ink">Publication checklist</h2>
              <div className="mt-4 space-y-3">
                {Object.entries(checks).map(([label, checked]) => (
                  <label key={label} className="flex items-start gap-3 text-body-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => setChecks((current) => ({ ...current, [label]: !checked }))}
                      className="mt-0.5 h-4 w-4 accent-terracotta"
                    />
                    <span className={checked ? "text-ink" : "text-stone"}>{label}</span>
                  </label>
                ))}
              </div>
              {!checks["Structural engineer sign-off"] && (
                <div className="mt-4 rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-body-sm text-warning">
                  <Icon name="warning" className="mr-1 text-[16px]" />
                  Structural sign-off is required before publication.
                </div>
              )}
            </Card>

            <Card className="p-5">
              <Eyebrow>Plate preview</Eyebrow>
              <img
                src={project.cover}
                alt={project.title}
                className="mt-3 aspect-[3/2] w-full rounded-lg border border-hairline object-cover"
              />
              <p className="mt-2 text-body-sm text-stone">This is the current archive cover plate.</p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export function LeadsInbox() {
  const { leads, decideLead } = useApp();
  const [tab, setTab] = useState("Pending");
  const filtered = leads.filter((lead) => lead.status === tab);
  const pending = leads.filter((lead) => lead.status === "Pending").length;
  const decided = leads.filter(
    (lead) => lead.status === "Accepted" || lead.status === "Declined" || lead.status === "Completed",
  ).length;
  const accepted = leads.filter((lead) => lead.status === "Accepted" || lead.status === "Completed").length;
  const responseRate = decided > 0 ? Math.round((accepted / decided) * 100) : 0;

  return (
    <>
      <PageHeader
        eyebrow="Leads & inquiries"
        title="Commission briefing inbox"
        description="Review client briefs, attached surveys, and the 48-hour decision window. Accepted requests unlock your contact desk."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="warning">
              <Icon name="timer" className="text-[14px]" />
              {pending} awaiting decision
            </Badge>
            <Badge tone="verified">Acceptance rate {responseRate}%</Badge>
          </div>
        }
      />

      <div className="container-page grid gap-6 py-8 md:py-10 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Tabs
            items={[
              { id: "Pending", label: "Pending", count: leads.filter((lead) => lead.status === "Pending").length },
              { id: "Accepted", label: "Accepted", count: leads.filter((lead) => lead.status === "Accepted").length },
              { id: "Declined", label: "Declined", count: leads.filter((lead) => lead.status === "Declined").length },
              { id: "Completed", label: "Completed", count: leads.filter((lead) => lead.status === "Completed").length },
              { id: "Cancelled", label: "Cancelled", count: leads.filter((lead) => lead.status === "Cancelled").length },
            ]}
            value={tab}
            onChange={setTab}
          />
          {filtered.length > 0 ? (
            <div className="mt-5 space-y-4">
              {filtered.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onAccept={() => void decideLead(lead.id, "Accepted")}
                  onDecline={() => {
                    const note = window.prompt("Add a short note for the client before declining:");
                    if (note?.trim()) void decideLead(lead.id, "Declined", note.trim());
                  }}
                  onComplete={() => {
                    if (window.confirm("Mark this commission as completed? This closes the request.")) {
                      void decideLead(lead.id, "Completed");
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <EmptyState
                icon="inbox"
                title={`No ${tab.toLowerCase()} leads`}
                description="New commission briefs will appear here as clients request your video demo."
              />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="p-5">
            <Eyebrow>Decision window</Eyebrow>
            <p className="mt-2 font-serif text-headline-md text-ink">48 hours per brief</p>
            <p className="mt-2 text-body-sm text-stone">
              Accepting a request unlocks the full client dossier and opens the direct contact desk. Declining returns
              the brief to the client with a note.
            </p>
            <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-body-sm">
              {leads.filter((lead) => lead.status === "Pending").slice(0, 3).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-stone">{lead.client}</span>
                  <span className="shrink-0 text-ink tnum">{lead.deadline}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-ink p-5 text-white">
            <Eyebrow className="text-white/50">Council note</Eyebrow>
            <p className="mt-2 font-serif text-headline-sm text-white">Keep your response rate above 90%.</p>
            <p className="mt-2 text-body-sm text-white/65">
              Practices that consistently respond within the window retain priority placement in the verified
              directory.
            </p>
          </Card>

          <Card className="p-5">
            <Eyebrow>Need to pause leads?</Eyebrow>
            <p className="mt-2 text-body-sm text-stone">
              Set your practice to capacity and new briefs will be routed to the waiting list.
            </p>
            <Button variant="secondary" size="sm" className="mt-4 w-full">
              <Icon name="pause_circle" className="text-[16px]" />
              Set practice to capacity
            </Button>
          </Card>
        </aside>
      </div>
    </>
  );
}

