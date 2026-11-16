import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getArchitect, getProject, getProjectsByArchitect, leadsSeed, projects } from "../data";
import { useApp } from "../context/context";
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
  const { requests, leads, notify } = useApp();
  const architect = getArchitect("adaeze-okafor-studio");
  const works = getProjectsByArchitect("adaeze-okafor-studio");
  const pendingLeads = leads.filter((lead) => lead.status === "Pending");
  const newRequests = requests.filter((request) => request.status === "Requested").length;

  const metrics = [
    { label: "Profile views", value: "1,284", delta: "+18% this month", points: "0,26 14,22 28,24 42,14 56,18 70,10 84,13 100,5" },
    { label: "Saves & bookmarks", value: "96", delta: "+6 this week", points: "0,24 14,20 28,21 42,16 56,18 70,14 84,10 100,8" },
    { label: "New requests", value: String(newRequests + 6), delta: `+${newRequests + 2} this week`, points: "0,28 14,24 28,25 42,20 56,22 70,16 84,18 100,10" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Practice workspace"
        title="Good morning, Adaeze."
        description="Your practice record, active monographs, and new commission briefs in one place."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="warning">
              <Icon name="pending" className="text-[14px]" />
              Form B review pending
            </Badge>
            <LinkButton to="/provider/profile" variant="secondary" size="sm">
              Edit profile
            </LinkButton>
          </div>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-warning/25 bg-warning-soft px-5 py-4">
          <div className="flex items-start gap-3">
            <Icon name="warning" className="mt-0.5 text-[20px] text-warning" />
            <div>
              <p className="text-label text-warning">Annual practising licence needs attention</p>
              <p className="text-body-sm text-warning/80">
                Your 2026 Form B filing is in council review. Verification usually completes within 72 hours.
              </p>
            </div>
          </div>
          <Link to="/provider/profile#verification" className="text-body-sm text-warning underline-offset-4 hover:underline">
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
                <span className="font-serif text-headline-sm text-terracotta tnum">75%</span>
              </div>
              <ProgressBar value={75} className="mt-4" />
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  ["Practice basics", true],
                  ["Contact desk", true],
                  ["Typologies & focus", true],
                  ["Demo walkthrough", false],
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
                <Button variant="secondary" size="sm" onClick={() => notify("Your public profile is live in the verified directory.")}>
                  View public page
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                <div>
                  <Eyebrow>Monograph exhibits</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Published works</h2>
                </div>
                <Link
                  to="/provider/projects/the-epe-courtyard-villa/edit"
                  className="text-body-sm text-terracotta hover:underline"
                >
                  Manage
                </Link>
              </div>
              <div className="divide-y divide-hairline">
                {(works.length > 0 ? works : projects.slice(0, 2)).map((project, index) => (
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
                ))}
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
                  ["ARCON", architect?.arcon.replace("ARCON ", "")],
                  ["Chapter", "Lagos"],
                  ["Years", `${architect?.years} years`],
                  ["Built works", String(architect?.works)],
                  ["Commission tier", architect?.feeTier],
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
                  <p className="font-serif text-headline-md text-ink tnum">94%</p>
                  <p className="text-body-sm text-stone">Acceptance rate</p>
                </div>
                <div>
                  <p className="font-serif text-headline-md text-ink tnum">8.4h</p>
                  <p className="text-body-sm text-stone">Avg. response</p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-surface-low p-3 text-body-sm text-stone">
                <Icon name="info" className="mr-1 text-[16px] text-terracotta" />
                The council recommends responding within the 72-hour window to maintain verified status.
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
  const { notify } = useApp();
  const [firm, setFirm] = useState("Adaeze Okafor Studio");
  const [principal, setPrincipal] = useState("Adaeze Okafor");
  const [arcon, setArcon] = useState("ARCON #3812");
  const [chapter, setChapter] = useState("Lagos");
  const [email, setEmail] = useState("studio@adaezeokafor.ng");
  const [phone, setPhone] = useState("+234 1 460 3812");
  const [website, setWebsite] = useState("adaezeokafor.ng");
  const [bio, setBio] = useState(
    "Founded in 2011, the studio pairs laterite rammed earth with tropical modernism across residential and cultural commissions.",
  );
  const [demoUrl, setDemoUrl] = useState("https://vimeo.com/archng/adaeze-walkthrough");
  const [focus, setFocus] = useState<string[]>(["Tropical Modernism", "Rammed Earth", "Coastal Residential"]);

  const toggleFocus = (value: string) => {
    setFocus((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const save = (event: FormEvent) => {
    event.preventDefault();
    notify("Practice profile saved. Changes are live in the verified directory.");
  };

  return (
    <>
      <PageHeader
        eyebrow="Profile editor"
        title="Practice accreditation & contact"
        description="Keep your registered practice record, public monograph, and contact desk current."
        action={
          <div className="flex items-center gap-3">
            <Badge>Profile completeness 75%</Badge>
            <LinkButton to="/architects/adaeze-okafor-studio" variant="secondary" size="sm">
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
              <Field label="Principal architect" required>
                <Input value={principal} onChange={(event) => setPrincipal(event.target.value)} />
              </Field>
              <Field label="ARCON registration number" required>
                <Input value={arcon} onChange={(event) => setArcon(event.target.value)} />
              </Field>
              <Field label="Chapter">
                <Select value={chapter} onChange={(event) => setChapter(event.target.value)}>
                  {["Lagos", "Abuja FCT", "Rivers", "Oyo", "Enugu"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
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
              <Field label="Website" className="sm:col-span-2">
                <Input value={website} onChange={(event) => setWebsite(event.target.value)} />
              </Field>
            </div>
            <div className="mt-5 space-y-3">
              {["Show studio email to accepted clients", "Show direct mobile to accepted clients", "Publish response window on public profile"].map(
                (label, index) => (
                  <label key={label} className="flex items-center justify-between gap-4 rounded-lg border border-hairline bg-surface-low px-4 py-3">
                    <span className="text-body-sm text-ink">{label}</span>
                    <input type="checkbox" defaultChecked={index !== 1} className="h-4 w-4 accent-terracotta" />
                  </label>
                ),
              )}
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
                "Cultural",
                "Adaptive Reuse",
                "Hospitality",
                "Small Residential",
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
              {[
                ["2024", "The Epe Courtyard Villa completed", "₦450m · 620 m² · Private residence"],
                ["2022", "Lagos State Architecture Prize", "Commendation for sustainable practice"],
                ["2011", "Studio founded in Ikoyi", "Principal practice established"],
              ].map(([year, title, detail]) => (
                <div key={title} className="flex gap-4 rounded-lg border border-hairline p-4">
                  <span className="font-serif text-headline-sm text-terracotta tnum">{year}</span>
                  <div className="flex-1">
                    <p className="text-label text-ink">{title}</p>
                    <p className="text-body-sm text-stone">{detail}</p>
                  </div>
                  <button type="button" className="text-stone hover:text-ink" aria-label={`Edit ${title}`}>
                    <Icon name="edit" className="text-[17px]" />
                  </button>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => notify("Milestone editor opened.")}>
              <Icon name="add" className="text-[16px]" />
              Add milestone
            </Button>
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
                  <Button variant="secondary" size="sm" onClick={() => notify("Video link validated.")}>
                    Validate link
                  </Button>
                  <Badge tone="verified">
                    <Icon name="check_circle" className="text-[14px]" />
                    Published
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
              <Badge tone="warning">Form B in review</Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ["Form B — 2026 annual practising licence", "Submitted 14 Feb 2026"],
                ["ARCON certificate of registration", "Verified 04 Jan 2026"],
                ["Professional indemnity cover", "Expires 31 Dec 2026"],
              ].map(([label, detail]) => (
                <div key={label} className="rounded-lg border border-hairline bg-surface-low p-4">
                  <p className="flex items-center gap-2 text-body-sm text-ink">
                    <Icon name="description" className="text-[17px] text-stone" />
                    {label}
                  </p>
                  <p className="mt-1 pl-7 text-body-sm text-stone">{detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="sticky bottom-4 z-20 flex items-center justify-between gap-4 rounded-lg border border-hairline bg-card/95 p-3 shadow-lift backdrop-blur md:bottom-6">
            <p className="hidden text-body-sm text-stone sm:block">Unsaved changes are kept only in this session.</p>
            <div className="flex w-full gap-2 sm:w-auto">
              <Button variant="secondary" className="flex-1 sm:flex-none" onClick={() => notify("Draft saved to your browser session.")}>
                Save draft
              </Button>
              <Button type="submit" className="flex-1 sm:flex-none">
                Publish changes
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
  const { notify } = useApp();
  const project = getProject(id) ?? getProject("the-epe-courtyard-villa");
  const [status, setStatus] = useState("Published");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean>>({
    "ARCON registration verified": true,
    "Client consent for images": true,
    "Technical data authenticated": true,
    "Structural engineer sign-off": false,
  });

  useEffect(() => {
    if (!uploading || progress >= 100) return;
    const timer = window.setTimeout(() => setProgress((current) => Math.min(current + 10, 100)), 140);
    return () => window.clearTimeout(timer);
  }, [uploading, progress]);

  useEffect(() => {
    if (!uploading || progress < 100) return;
    const timer = window.setTimeout(() => {
      setUploading(false);
      notify("Plate uploaded and queued for conversion.");
    }, 240);
    return () => window.clearTimeout(timer);
  }, [uploading, progress, notify]);

  if (!project) return null;
  const architect = getArchitect(project.architectSlug);

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
              <option>Published</option>
              <option>Draft</option>
              <option>Hidden</option>
            </select>
            <Button size="sm" onClick={() => notify(`Project saved with status: ${status}.`)}>
              Save plate
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
            <Badge tone={status === "Published" ? "verified" : "warning"}>{status}</Badge>
            <LinkButton to={`/projects/${project.slug}`} variant="secondary" size="sm">
              Preview
              <Icon name="open_in_new" className="text-[15px]" />
            </LinkButton>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>Plate uploader</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Archival drawings &amp; photography</h2>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setProgress(0);
                    setUploading(true);
                  }}
                  disabled={uploading}
                >
                  <Icon name="upload" className="text-[16px]" />
                  {uploading ? "Uploading…" : "Upload plate"}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProgress(0);
                  setUploading(true);
                }}
                className="mt-4 flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-surface-low px-6 py-10 text-center transition-colors hover:border-ink"
              >
                <Icon name="cloud_upload" className="text-[28px] text-stone" />
                <span className="mt-3 text-label text-ink">Drop drawings here or select a file</span>
                <span className="mt-1 text-body-sm text-stone">PDF, JPG, PNG, or TIFF · up to 40MB per plate</span>
              </button>
              {(uploading || progress > 0) && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-ink">plate-05-courtyard-section.pdf</span>
                    <span className="text-stone tnum">{progress}%</span>
                  </div>
                  <ProgressBar value={progress} className="mt-2" />
                  <p className="mt-1 text-body-sm text-stone">
                    {progress < 100 ? "Converting to archival web plate…" : "Queued for council authentication."}
                  </p>
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
                  <Input defaultValue={project.title} />
                </Field>
                <Field label="Typology">
                  <Select defaultValue={project.typology}>
                    {["Private Residence", "Civic / Institutional", "Hospitality", "Cultural", "Commercial"].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Location">
                  <Input defaultValue={project.city} />
                </Field>
                <Field label="Completion year">
                  <Input defaultValue={project.year} />
                </Field>
                <Field label="Gross floor area">
                  <Input defaultValue={project.gfa} />
                </Field>
                <Field label="Construction scale (₦)">
                  <Input defaultValue={project.budget.toLocaleString("en-NG")} className="tnum" />
                </Field>
                <Field label="Structural system" className="sm:col-span-2">
                  <Input defaultValue={project.structural} />
                </Field>
                <Field label="Climate strategy" className="sm:col-span-2">
                  <Input defaultValue={project.climate} />
                </Field>
                <Field label="Monograph summary" className="sm:col-span-2">
                  <Textarea defaultValue={project.summary} />
                </Field>
              </div>
              <div className="mt-5 flex justify-end gap-2 border-t border-hairline pt-5">
                <Button
                  variant="secondary"
                  onClick={() => {
                    notify("Project reverted to last published state.");
                    navigate("/provider");
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => notify(`Project saved with status: ${status}.`)}>Save changes</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <Eyebrow>Publication</Eyebrow>
              <div className="mt-4 space-y-3">
                {["Published", "Draft", "Hidden"].map((option) => (
                  <label
                    key={option}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3",
                      status === option ? "border-ink bg-surface-low" : "border-hairline",
                    )}
                  >
                    <span>
                      <span className="block text-label text-ink">{option}</span>
                      <span className="block text-body-sm text-stone">
                        {option === "Published"
                          ? "Visible to everyone in the public archive."
                          : option === "Draft"
                            ? "Only visible to your practice."
                            : "Temporarily removed from the archive."}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="status"
                      checked={status === option}
                      onChange={() => setStatus(option)}
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
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 w-full"
                onClick={() => notify("Cover plate selector opened.")}
              >
                <Icon name="photo_library" className="text-[16px]" />
                Change cover plate
              </Button>
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

  return (
    <>
      <PageHeader
        eyebrow="Leads & inquiries"
        title="Commission briefing inbox"
        description="Review client briefs, attached surveys, and the 72-hour decision window. Accepted requests unlock your contact desk."
        action={
          <div className="flex items-center gap-3">
            <Badge tone="warning">
              <Icon name="timer" className="text-[14px]" />
              {pending} awaiting decision
            </Badge>
            <Badge tone="verified">Response rate 94%</Badge>
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
                  onAccept={() => decideLead(lead.id, "Accepted")}
                  onDecline={() => decideLead(lead.id, "Declined")}
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
            <p className="mt-2 font-serif text-headline-md text-ink">72 hours per brief</p>
            <p className="mt-2 text-body-sm text-stone">
              Accepting a request unlocks the full client dossier and opens the direct contact desk. Declining returns
              the brief to the client with a note.
            </p>
            <div className="mt-4 space-y-2 border-t border-hairline pt-4 text-body-sm">
              {leadsSeed.slice(0, 3).map((lead) => (
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
