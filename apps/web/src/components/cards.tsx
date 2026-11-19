import { Link } from "react-router-dom";
import { IMG, type Architect, type DemoRequest, type Lead, type Project } from "../data";
import { useApp } from "../context/context";
import { formatNaira } from "../lib/format";
import { cn } from "../lib/cn";
import { Badge, Button, Card, Icon, StatusPill, VerifiedBadge } from "./ui";

export function ArchitectCard({ architect, className }: { architect: Architect; className?: string }) {
  return (
    <Card className={cn("group flex flex-col overflow-hidden transition-colors hover:border-stone-soft", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Link to={`/architects/${architect.slug}`} aria-label={`View ${architect.firm}`}>
          <img
            src={architect.portrait}
            alt={`${architect.name}, principal of ${architect.firm}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-4">
          {architect.demoAvailable ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-2.5 py-1 text-caps uppercase tracking-[0.07em] text-white backdrop-blur-sm">
              <Icon name="play_circle" className="text-[14px]" />
              Video demo
            </span>
          ) : (
            <span />
          )}
          <VerifiedBadge className="bg-white/95" />
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-headline-sm text-ink">
              <Link to={`/architects/${architect.slug}`} className="hover:text-terracotta">
                {architect.firm}
              </Link>
            </h3>
            <p className="mt-1 text-body-sm text-stone">
              {architect.name} · {architect.city}
            </p>
          </div>
          <span className="shrink-0 text-body-sm text-stone-soft tnum">{architect.arcon}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {architect.specialties.map((specialty) => (
            <Badge key={specialty}>{specialty}</Badge>
          ))}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-y border-hairline py-3 text-center">
          <div>
            <dt className="text-caps uppercase text-stone-soft">Years</dt>
            <dd className="mt-0.5 text-label text-ink tnum">{architect.years}</dd>
          </div>
          <div className="border-x border-hairline">
            <dt className="text-caps uppercase text-stone-soft">Works</dt>
            <dd className="mt-0.5 text-label text-ink tnum">{architect.works}</dd>
          </div>
          <div>
            <dt className="text-caps uppercase text-stone-soft">Fee tier</dt>
            <dd className="mt-0.5 text-label text-ink tnum">{architect.feeTier}</dd>
          </div>
        </dl>
        <div className="mt-auto flex gap-2.5 pt-4">
          <Link
            to={`/architects/${architect.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-hairline-strong bg-card text-body-sm text-ink transition-colors hover:bg-surface-low"
          >
            Monograph
          </Link>
          <Link
            to={`/request-demo/${architect.slug}`}
            className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-terracotta bg-terracotta text-body-sm text-white transition-colors hover:border-terracotta-dark hover:bg-terracotta-dark"
          >
            Request demo
            <Icon name="arrow_outward" className="text-[15px]" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  const { getArchitect } = useApp();
  const architect = getArchitect(project.architectSlug);
  return (
    <Card className={cn("group overflow-hidden transition-colors hover:border-stone-soft", className)}>
      <div className="relative aspect-[3/2] overflow-hidden bg-sand">
        <Link to={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
          <img
            src={project.cover}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-caps uppercase tracking-[0.07em] text-stone">
          {project.typology}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-caps uppercase tracking-[0.08em] text-stone-soft">
            {project.year} · {project.city}
          </span>
          <span className="text-body-sm text-stone tnum">{project.gfa}</span>
        </div>
        <h3 className="mt-2 font-serif text-headline-sm text-ink">
          <Link to={`/projects/${project.slug}`} className="hover:text-terracotta">
            {project.title}
          </Link>
        </h3>
        <p className="mt-1 text-body-sm text-stone">{architect?.firm}</p>
        <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
          <span className="text-caps uppercase text-stone-soft">Contract scale</span>
          <span className="text-label text-ink tnum">{formatNaira(project.budget)}</span>
        </div>
      </div>
    </Card>
  );
}

export function RequestCard({ request }: { request: DemoRequest }) {
  const { getArchitect } = useApp();
  const architect = getArchitect(request.architectSlug);
  const firm = architect?.firm ?? request.providerFirm ?? "Verified practice";
  const name = architect?.name ?? request.providerName ?? firm;
  const portrait = architect?.portrait || request.providerPortrait || IMG.portraitA;

  return (
    <Card className="p-5 transition-colors hover:border-stone-soft">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={portrait}
            alt={name}
            className="h-14 w-14 rounded-lg border border-hairline object-cover"
          />
          <div>
            <h3 className="font-serif text-headline-sm text-ink">{firm}</h3>
            <p className="text-body-sm text-stone">
              {request.projectType} · {request.state}
            </p>
          </div>
        </div>
        <StatusPill status={request.status} />
      </div>
      <p className="mt-4 line-clamp-2 text-body text-stone">{request.brief}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-body-sm text-stone">
          <span>
            Budget <strong className="font-medium text-ink tnum">{request.budget}</strong>
          </span>
          <span>
            Sent <strong className="font-medium text-ink tnum">{request.createdAt}</strong>
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to={`/architects/${request.architectSlug}`}
            className="inline-flex h-9 items-center rounded-lg border border-hairline-strong bg-card px-3.5 text-body-sm text-ink hover:bg-surface-low"
          >
            Monograph
          </Link>
          <Link
            to={`/requests/${request.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-ink bg-ink px-3.5 text-body-sm text-white hover:bg-stone"
          >
            Open request
            <Icon name="arrow_forward" className="text-[15px]" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function LeadCard({
  lead,
  onAccept,
  onDecline,
  onComplete,
}: {
  lead: Lead;
  onAccept: () => void;
  onDecline: () => void;
  onComplete?: () => void;
}) {
  const urgent = lead.deadline === "4h" || lead.deadline === "18h";
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-headline-sm text-ink">{lead.client}</h3>
          <p className="mt-1 text-body-sm text-stone">
            {lead.projectType} · {lead.city}
          </p>
        </div>
        <Badge tone={urgent ? "danger" : "warning"}>
          <Icon name="timer" className="text-[14px]" />
          {lead.deadline === "46h" || lead.deadline === "39h" ? `${lead.deadline} to decide` : lead.deadline}
        </Badge>
      </div>
      <p className="mt-4 text-body text-stone">{lead.brief}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-1 text-body-sm text-stone">
          <span>
            Budget <strong className="font-medium text-ink tnum">{lead.budget}</strong>
          </span>
          <span>
            Received <strong className="font-medium text-ink">{lead.receivedAt}</strong>
          </span>
        </div>
        {lead.status === "Pending" ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={onDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={onAccept}>
              Accept request
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-end gap-2">
            {lead.status === "Accepted" && onComplete && (
              <Button size="sm" onClick={onComplete}>
                Mark completed
              </Button>
            )}
            <Badge tone={lead.status === "Declined" || lead.status === "Cancelled" ? "danger" : "verified"}>
              <Icon
                name={lead.status === "Declined" || lead.status === "Cancelled" ? "cancel" : "check_circle"}
                className="text-[14px]"
              />
              {lead.status}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
