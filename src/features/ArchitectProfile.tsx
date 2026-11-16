import { Link, useParams } from "react-router-dom";
import { getArchitect, getProjectsByArchitect } from "../data";
import { useApp } from "../context/context";
import { ProjectCard } from "../components/cards";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Icon,
  LinkButton,
  VerifiedBadge,
} from "../components/ui";

export default function ArchitectProfile({ forceUnlocked = false }: { forceUnlocked?: boolean }) {
  const { slug = "" } = useParams();
  const { saved, toggleSave, hasAccepted, notify, signedIn, role } = useApp();
  const architect = getArchitect(slug);

  if (!architect) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon="architecture"
          title="Practice not found"
          description="This monograph may have been moved or the practice is no longer listed in the registry."
          action={<LinkButton to="/architects">Return to directory</LinkButton>}
        />
      </div>
    );
  }

  const works = getProjectsByArchitect(architect.slug);
  const unlocked = forceUnlocked || (signedIn && role === "client" && hasAccepted(architect.slug));
  const isSaved = saved.includes(architect.slug);

  const handleSave = () => {
    toggleSave(architect.slug);
    notify(isSaved ? `${architect.firm} removed from your archive.` : `${architect.firm} saved to your archive.`);
  };

  return (
    <>
      <div className="border-b border-hairline bg-surface-low/60">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-body-sm text-stone">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/architects" className="hover:text-terracotta">
              Architects
            </Link>
            <Icon name="chevron_right" className="text-[15px]" />
            <span className="text-ink">{architect.firm}</span>
          </div>
          <Badge tone="verified">
            <Icon name="verified" filled className="text-[14px]" />
            ARCON licence current · 2026
          </Badge>
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-panel border border-hairline">
              <img
                src={architect.cover}
                alt={`Recent work by ${architect.firm}`}
                className="aspect-[3/2] w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-ink/70 to-transparent p-5">
                <div className="flex items-center gap-2">
                  {architect.demoAvailable && (
                    <Badge className="border-white/20 bg-white/95 text-ink">
                      <Icon name="play_circle" className="text-[14px]" />
                      Video demo available
                    </Badge>
                  )}
                  <Badge className="border-white/20 bg-white/95 text-ink">{architect.years} years practice</Badge>
                </div>
                <span className="text-body-sm text-white/90">{architect.city}</span>
              </div>
            </div>

            {unlocked && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-verified/30 bg-verified-soft px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-verified text-white">
                    <Icon name="lock_open" className="text-[20px]" />
                  </span>
                  <div>
                    <p className="text-label text-verified">Accepted client access</p>
                    <p className="text-body-sm text-verified/80">
                      Full video walkthrough, CAD plates, and direct studio contact are unlocked.
                    </p>
                  </div>
                </div>
                <Badge tone="verified">Unlocked</Badge>
              </div>
            )}

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <VerifiedBadge />
                <Badge>{architect.arcon}</Badge>
              </div>
              <h1 className="mt-4 font-serif text-headline-xl text-ink md:text-display">{architect.firm}</h1>
              <p className="mt-2 text-body-lg text-stone">
                {architect.name}, Principal Architect · {architect.city}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {architect.specialties.map((specialty) => (
                  <Badge key={specialty}>{specialty}</Badge>
                ))}
              </div>

              <blockquote className="mt-8 border-l-2 border-terracotta pl-5 font-serif text-headline-md leading-snug text-ink">
                “{architect.philosophy}”
              </blockquote>
              <p className="mt-5 text-body leading-relaxed text-stone">{architect.bio}</p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline sm:grid-cols-4">
              {[
                ["Years in practice", String(architect.years)],
                ["Built works", String(architect.works)],
                ["Commission tier", architect.feeTier],
                ["Chapter", architect.state],
              ].map(([label, value]) => (
                <div key={label} className="bg-card px-4 py-4">
                  <p className="text-caps uppercase tracking-[0.06em] text-stone-soft">{label}</p>
                  <p className="mt-1 font-serif text-headline-sm text-ink tnum">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Eyebrow>Technical walkthrough</Eyebrow>
              <div className="relative mt-3 overflow-hidden rounded-panel border border-hairline">
                <img
                  src={architect.cover}
                  alt=""
                  className={`aspect-[16/9] w-full object-cover ${unlocked ? "" : "blur-[6px]"}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/45 p-6 text-center">
                  {unlocked ? (
                    <>
                      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-terracotta shadow-lift">
                        <Icon name="play_arrow" filled className="text-[32px]" />
                      </span>
                      <p className="mt-4 font-serif text-headline-sm text-white">Studio technical walkthrough</p>
                      <p className="mt-1 text-body-sm text-white/70">21 minutes · English · Recorded January 2026</p>
                    </>
                  ) : (
                    <>
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-ink/60 text-white">
                        <Icon name="lock" />
                      </span>
                      <p className="mt-4 font-serif text-headline-sm text-white">Walkthrough locked</p>
                      <p className="mt-2 max-w-md text-body-sm text-white/70">
                        Request a video consultation to unlock the full 21-minute technical tour and studio contact
                        desk.
                      </p>
                      <LinkButton to={`/request-demo/${architect.slug}`} size="sm" className="mt-4">
                        Request access
                      </LinkButton>
                    </>
                  )}
                </div>
                <span className="absolute right-4 top-4 rounded-full bg-ink/70 px-2.5 py-1 text-caps uppercase tracking-[0.07em] text-white">
                  {unlocked ? "21:04" : "Locked"}
                </span>
              </div>
            </div>

            {unlocked && (
              <Card className="mt-6 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Eyebrow>Direct studio desk</Eyebrow>
                    <p className="mt-1 text-body-sm text-stone">Available to accepted clients, Mon–Fri 9am–5pm WAT.</p>
                  </div>
                  <Badge tone="verified">Priority line</Badge>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["mail", "Email studio", `studio@${architect.slug.replaceAll("-", "")}.ng`],
                    ["call", "Studio line", "+234 1 460 3812"],
                    ["smartphone", "Direct mobile", "+234 803 555 3812"],
                    ["chat", "WhatsApp channel", "Open priority channel"],
                  ].map(([icon, label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => notify(`${label}: ${value}`)}
                      className="flex items-center gap-3 rounded-lg border border-hairline bg-surface-low px-4 py-3 text-left transition-colors hover:border-ink"
                    >
                      <Icon name={icon} className="text-[19px] text-terracotta" />
                      <span>
                        <span className="block text-caps uppercase tracking-[0.07em] text-stone-soft">{label}</span>
                        <span className="block text-body-sm text-ink">{value}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            <div className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <Eyebrow>Selected monographs</Eyebrow>
                  <h2 className="mt-2 font-serif text-headline-lg text-ink">Built work</h2>
                </div>
                <span className="text-body-sm text-stone tnum">{works.length} published</span>
              </div>
              {works.length > 0 ? (
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {works.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <Card className="mt-5 p-8 text-center">
                  <p className="font-serif text-headline-sm text-ink">Monographs in preparation</p>
                  <p className="mt-2 text-body-sm text-stone">
                    This practice has not yet published a project plate to the registry.
                  </p>
                </Card>
              )}
            </div>
          </div>

          <aside>
            <Card className="lg:sticky lg:top-24">
              <div className="border-b border-hairline p-5">
                <div className="flex items-center gap-4">
                  <img
                    src={architect.portrait}
                    alt={architect.name}
                    className="h-16 w-16 rounded-lg border border-hairline object-cover"
                  />
                  <div>
                    <p className="text-label text-ink">{architect.name}</p>
                    <p className="text-body-sm text-stone">Principal Architect</p>
                    <VerifiedBadge className="mt-2" label="Verified" />
                  </div>
                </div>
                <dl className="mt-5 space-y-2.5 text-body-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-stone">ARCON registration</dt>
                    <dd className="text-ink tnum">{architect.arcon.replace("ARCON ", "")}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-stone">Response window</dt>
                    <dd className="text-ink">72 hours</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-stone">Demo fee</dt>
                    <dd className="text-ink">Complimentary</dd>
                  </div>
                </dl>
              </div>
              <div className="space-y-2.5 p-5">
                {unlocked ? (
                  <LinkButton to="/requests/r1" size="lg" className="w-full">
                    Open accepted request
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </LinkButton>
                ) : (
                  <LinkButton to={`/request-demo/${architect.slug}`} size="lg" className="w-full">
                    Request a video demo
                    <Icon name="video_call" className="text-[18px]" />
                  </LinkButton>
                )}
                <Button variant="secondary" className="w-full" onClick={handleSave}>
                  <Icon name={isSaved ? "bookmark_added" : "bookmark_border"} filled={isSaved} className="text-[18px]" />
                  {isSaved ? "Saved to archive" : "Save architect"}
                </Button>
                <p className="pt-1 text-center text-[11px] leading-relaxed text-stone-soft">
                  By requesting a demo you agree to the registry's client safeguards and escrow code.
                </p>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}
