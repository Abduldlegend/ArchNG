import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { architects, getArchitect, projects } from "../data";
import { formatNaira } from "../lib/format";
import { ArchitectCard, ProjectCard } from "../components/cards";
import {
  Badge,
  Button,
  Card,
  Crosshairs,
  Eyebrow,
  Icon,
  Input,
  LinkButton,
  SectionHeading,
  Select,
} from "../components/ui";

const stats = [
  { value: "280+", label: "ARCON verified studios" },
  { value: "₦42.8B", label: "Built capital monitored" },
  { value: "7", label: "Active urban chapters" },
  { value: "100%", label: "Licensure verification" },
];

const steps = [
  {
    icon: "travel_explore",
    title: "Discover the practice",
    detail: "Browse verified monographs, built works, and technical data. Every practice holds a current ARCON licence.",
  },
  {
    icon: "video_call",
    title: "Request a video demo",
    detail: "Submit your brief and proposed budget. Accepted clients unlock the full walkthrough and direct studio desk.",
  },
  {
    icon: "handshake",
    title: "Commission with confidence",
    detail: "Milestones, contract scale, and inspection rights are documented through the registry from day one.",
  },
];

export default function Discover() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("");
  const [typology, setTypology] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (state) params.set("state", state);
    if (typology) params.set("typology", typology);
    navigate(`/architects?${params.toString()}`);
  };

  const featured = projects[0];
  const featuredArchitect = getArchitect(featured.architectSlug);

  return (
    <>
      <section className="relative overflow-hidden border-b border-hairline blueprint-grid">
        <Crosshairs />
        <div className="container-page relative py-12 md:py-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge tone="verified">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-verified" />
              Verified ARCON commissions only
            </Badge>
            <div className="hidden items-center gap-3 text-caps uppercase tracking-[0.08em] text-stone-soft sm:flex">
              <span>Regulatory compliance act CAP A19 LFN</span>
              <span className="h-1 w-1 rounded-full bg-stone-soft" />
              <span>Curated monographs 2026</span>
            </div>
          </div>

          <div className="mt-10 max-w-4xl">
            <h1 className="font-serif text-display-mobile text-ink md:text-display">
              Commission visionary spaces across Nigeria.
            </h1>
            <p className="mt-6 max-w-2xl text-body text-stone md:text-body-lg">
              Connect directly with verified ARCON-registered principal architects. Discover signature tropical
              modernist estates, public institutions, and sustainable earth commissions — accompanied by
              transparent feasibility data and instant video discovery calls.
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card px-5 py-4">
                <dd className="font-serif text-headline-md text-ink tnum">{stat.value}</dd>
                <dt className="mt-1 text-caps uppercase tracking-[0.06em] text-stone-soft">{stat.label}</dt>
              </div>
            ))}
          </dl>

          <form
            onSubmit={submit}
            className="mt-8 rounded-panel border border-hairline-strong bg-card p-3 shadow-lift"
          >
            <div className="grid gap-3 md:grid-cols-12 md:items-center">
              <div className="relative md:col-span-4">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by lead architect, firm, or project type"
                  className="border-0 bg-transparent pl-11 focus:border-0"
                  aria-label="Search architects"
                />
              </div>
              <div className="md:col-span-3 md:border-l md:border-hairline md:pl-3">
                <Select
                  value={state}
                  onChange={(event) => setState(event.target.value)}
                  className="border-0 bg-transparent"
                  aria-label="Filter by state"
                >
                  <option value="">All Nigerian territories</option>
                  {["Lagos", "Abuja FCT", "Rivers", "Oyo", "Enugu", "Osun"].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-3 md:border-l md:border-hairline md:pl-3">
                <Select
                  value={typology}
                  onChange={(event) => setTypology(event.target.value)}
                  className="border-0 bg-transparent"
                  aria-label="Filter by typology"
                >
                  <option value="">All typologies</option>
                  {["Private Residence", "Civic / Institutional", "Hospitality", "Cultural", "Commercial"].map(
                    (option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ),
                  )}
                </Select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full" aria-label="Search the directory">
                  <Icon name="arrow_forward" className="text-[18px]" />
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-body-sm text-stone">
            <span className="text-caps uppercase tracking-[0.08em] text-stone-soft">Popular</span>
            {["Lagos", "Abuja FCT", "Rivers", "Oyo"].map((shortcut) => (
              <Link
                key={shortcut}
                to={`/architects?state=${encodeURIComponent(shortcut)}`}
                className="rounded-full border border-hairline-strong bg-card px-3 py-1 transition-colors hover:border-ink hover:text-ink"
              >
                {shortcut}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-hairline py-14 md:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Curated ARCON studios"
            title={<>Practices of distinction</>}
            description="A small, verified selection from the registry. Every monograph includes licensure status, built work data, and a direct consultation route."
            action={
              <LinkButton to="/architects" variant="secondary">
                View full directory
                <Icon name="arrow_forward" className="text-[16px]" />
              </LinkButton>
            }
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {architects.slice(0, 3).map((architect) => (
              <ArchitectCard key={architect.id} architect={architect} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-hairline bg-surface-low py-14 md:py-20">
        <div className="container-page grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative">
            <div className="overflow-hidden rounded-panel border border-hairline">
              <img
                src={featured.cover}
                alt={featured.title}
                className="aspect-[3/2] w-full object-cover"
                loading="lazy"
              />
            </div>
            <Card className="relative -mt-10 ml-5 mr-10 p-5 shadow-lift md:absolute md:-bottom-8 md:left-8 md:right-auto md:mt-0 md:max-w-xs">
              <Eyebrow>Featured monograph</Eyebrow>
              <p className="mt-2 font-serif text-headline-sm text-ink">{featured.title}</p>
              <p className="mt-1 text-body-sm text-stone">
                {featuredArchitect?.firm} · {featured.city}
              </p>
              <Link
                to={`/projects/${featured.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-body-sm text-terracotta hover:underline"
              >
                Read the case study
                <Icon name="arrow_outward" className="text-[15px]" />
              </Link>
            </Card>
          </div>
          <div>
            <Eyebrow>Monograph archive</Eyebrow>
            <h2 className="mt-3 font-serif text-headline-lg text-ink">
              A building is only the visible part of the brief.
            </h2>
            <p className="mt-4 text-body text-stone">
              Each project page documents construction scale, gross floor area, structural system, and climate
              strategy — the same data the client saw before commissioning.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-5">
              <div>
                <dt className="text-caps uppercase text-stone-soft">Contract scale</dt>
                <dd className="mt-1 font-serif text-headline-md text-ink tnum">{formatNaira(featured.budget)}</dd>
              </div>
              <div>
                <dt className="text-caps uppercase text-stone-soft">Gross floor area</dt>
                <dd className="mt-1 font-serif text-headline-md text-ink tnum">{featured.gfa}</dd>
              </div>
              <div>
                <dt className="text-caps uppercase text-stone-soft">Structural system</dt>
                <dd className="mt-1 text-body text-ink">{featured.structural}</dd>
              </div>
              <div>
                <dt className="text-caps uppercase text-stone-soft">Climate strategy</dt>
                <dd className="mt-1 text-body text-ink">{featured.climate}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton to={`/architects/${featured.architectSlug}`} variant="dark">
                View the practice
                <Icon name="arrow_forward" className="text-[16px]" />
              </LinkButton>
              <LinkButton to={`/request-demo/${featured.architectSlug}`} variant="secondary">
                Request a demo
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-b border-hairline py-14 md:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="The ArchNG protocol"
            title="How commissions begin"
            description="A three-step route from discovery to a documented, ARCON-verified engagement."
          />
          <div className="mt-10 grid gap-px overflow-hidden rounded-panel border border-hairline bg-hairline md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sand text-ink">
                    <Icon name={step.icon} className="text-[21px]" />
                  </span>
                  <span className="font-serif text-headline-md text-hairline-strong tnum">0{index + 1}</span>
                </div>
                <h3 className="mt-5 font-serif text-headline-sm text-ink">{step.title}</h3>
                <p className="mt-2 text-body text-stone">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-page">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Recent monographs"
                title="Built work, documented"
                description="Every published project includes authenticated plates and a verified architect of record."
              />
              <div className="mt-6 flex flex-wrap gap-4">
                {projects.slice(1, 3).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="group flex items-center gap-3"
                  >
                    <img
                      src={project.cover}
                      alt={project.title}
                      className="h-16 w-20 rounded-lg border border-hairline object-cover"
                      loading="lazy"
                    />
                    <span>
                      <span className="block text-label text-ink group-hover:text-terracotta">{project.title}</span>
                      <span className="text-body-sm text-stone">
                        {project.city} · {project.year}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <ProjectCard project={projects[0]} />
          </div>
        </div>
      </section>

      <section className="border-t border-hairline bg-ink py-14 text-white md:py-16">
        <div className="container-page flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <span className="text-caps uppercase tracking-[0.1em] text-white/50">For practices</span>
            <h2 className="mt-3 font-serif text-headline-lg text-white">
              Publish your monograph to Nigeria's verified registry.
            </h2>
            <p className="mt-3 text-body text-white/65">
              Join 280+ ARCON-registered studios. Applications are reviewed by the council within 72 hours.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LinkButton to="/register" variant="primary" size="lg">
              Join as an architect
              <Icon name="north_east" className="text-[16px]" />
            </LinkButton>
            <LinkButton to="/signin" variant="secondary" size="lg">
              Client sign in
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
