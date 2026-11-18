import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../context/context";
import { IMG, type Project } from "../data";
import { formatNaira } from "../lib/format";
import { ProjectCard } from "../components/cards";
import {
  Badge,
  Card,
  EmptyState,
  Eyebrow,
  Icon,
  LinkButton,
  SectionHeading,
  VerifiedBadge,
} from "../components/ui";

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { projects, getArchitect, getProject, loadProject } = useApp();
  const [project, setProject] = useState<Project | undefined>(() => getProject(slug));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setProject(getProject(slug));
    setLoading(true);
    void loadProject(slug).then((result) => {
      if (!active) return;
      if (result) setProject(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!project && loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-terracotta" />
        <p className="mt-4 text-body-sm text-stone">Opening the project plate.</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon="image_not_supported"
          title="Monograph not found"
          description="This project plate is not in the public archive. It may have been withdrawn by the practice."
          action={<LinkButton to="/architects">Browse the directory</LinkButton>}
        />
      </div>
    );
  }

  const architect = getArchitect(project.architectSlug);
  const architectName = architect?.name ?? project.architectName ?? "Architect of record";
  const architectFirm = architect?.firm ?? project.architectFirm ?? "Verified practice";
  const architectPortrait = architect?.portrait ?? project.architectPortrait ?? IMG.portraitA;
  const more = projects.filter((item) => item.architectSlug === project.architectSlug && item.id !== project.id);
  const related = more.length > 0 ? more : projects.filter((item) => item.id !== project.id).slice(0, 2);

  return (
    <>
      <div className="border-b border-hairline bg-surface-low/60">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-body-sm text-stone">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/architects" className="hover:text-terracotta">
              Architects
            </Link>
            <Icon name="chevron_right" className="text-[15px]" />
            <Link to={`/architects/${project.architectSlug}`} className="hover:text-terracotta">
              {architectFirm}
            </Link>
            <Icon name="chevron_right" className="text-[15px]" />
            <span className="text-ink">{project.title}</span>
          </div>
          <Badge>Monograph plate</Badge>
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="terracotta">{project.typology}</Badge>
            <Badge>{project.year}</Badge>
            <Badge>{project.city}</Badge>
          </div>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-3xl">
              <h1 className="font-serif text-headline-xl text-ink md:text-display">{project.title}</h1>
              <p className="mt-3 text-body-lg text-stone">
                {architectFirm} · {project.state} · {project.gfa}
              </p>
            </div>
            <Link
              to={`/architects/${project.architectSlug}`}
              className="flex items-center gap-3 rounded-lg border border-hairline bg-card p-3 transition-colors hover:border-ink"
            >
              <img
                src={architectPortrait}
                alt={architectName}
                className="h-11 w-11 rounded-lg object-cover"
              />
              <span>
                <span className="block text-label text-ink">{architectName}</span>
                <span className="block text-body-sm text-stone">View the practice</span>
              </span>
              <Icon name="arrow_outward" className="text-[17px] text-stone" />
            </Link>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-panel border border-hairline">
            <img src={project.cover} alt={project.title} className="aspect-[16/9] w-full object-cover" />
            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <Badge className="bg-white/95 text-ink">
                <Icon name="photo_camera" className="text-[14px]" />
                Plate 01 of {project.plates.length}
              </Badge>
              <VerifiedBadge className="bg-white/95" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-5">
              <p className="font-serif text-headline-sm text-white">{project.gallery[0] ? "Principal exterior view" : ""}</p>
              <p className="text-body-sm text-white/70">
                {project.city} · Completed {project.year} · Photographed by the studio archive
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <Eyebrow>Project brief</Eyebrow>
              <p className="mt-3 text-body-lg leading-relaxed text-ink">{project.summary}</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Card className="p-5">
                  <Eyebrow>Authenticated audit</Eyebrow>
                  <dl className="mt-4 space-y-3 text-body-sm">
                    {[
                      ["Construction scale", formatNaira(project.budget)],
                      ["Gross floor area", project.gfa],
                      ["Structural system", project.structural],
                      ["Completion", project.year],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-start justify-between gap-4 border-b border-hairline pb-2 last:border-0 last:pb-0">
                        <dt className="text-stone">{label}</dt>
                        <dd className="text-right text-ink tnum">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
                <Card className="p-5">
                  <Eyebrow>Bioclimatic strategy</Eyebrow>
                  <p className="mt-4 text-body text-stone">{project.climate}</p>
                  <ul className="mt-4 space-y-2 text-body-sm text-ink">
                    {["Passive cooling", "Local material sourcing", "Shaded outdoor rooms", "Rainwater harvesting"].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-2">
                          <Icon name="check_circle" className="text-[16px] text-verified" />
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </Card>
              </div>

              <div className="mt-10">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <Eyebrow>Plate gallery</Eyebrow>
                    <h2 className="mt-2 font-serif text-headline-lg text-ink">Drawing set</h2>
                  </div>
                  <span className="text-body-sm text-stone">{project.plates.length} plates</span>
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {project.gallery.slice(0, 4).map((image, index) => (
                    <figure
                      key={image}
                      className={index === 0 ? "sm:col-span-2" : ""}
                    >
                      <div className="overflow-hidden rounded-lg border border-hairline">
                        <img
                          src={image}
                          alt={`${project.title} plate ${index + 1}`}
                          className={`w-full object-cover ${index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}
                          loading="lazy"
                        />
                      </div>
                      <figcaption className="mt-2 flex items-center justify-between text-body-sm text-stone">
                        <span>{project.plates[index]?.title ?? `Plate ${index + 1}`}</span>
                        <span className="tnum">{project.plates[index]?.scale ?? "1:100"}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>

              <div className="mt-10">
                <Eyebrow>Plate index</Eyebrow>
                <div className="mt-3 overflow-hidden rounded-lg border border-hairline">
                  <table className="w-full text-left text-body-sm">
                    <thead className="bg-surface-low text-caps uppercase tracking-[0.06em] text-stone-soft">
                      <tr>
                        <th className="px-4 py-3 font-medium">Plate</th>
                        <th className="px-4 py-3 font-medium">Drawing</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">Year</th>
                        <th className="px-4 py-3 text-right font-medium">Scale</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.plates.map((plate) => (
                        <tr key={plate.label} className="border-t border-hairline bg-card">
                          <td className="px-4 py-3 text-stone tnum">{plate.label}</td>
                          <td className="px-4 py-3 text-ink">{plate.title}</td>
                          <td className="hidden px-4 py-3 text-stone tnum sm:table-cell">{plate.year}</td>
                          <td className="px-4 py-3 text-right text-stone tnum">{plate.scale}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <aside>
              <Card className="lg:sticky lg:top-24">
                <div className="border-b border-hairline p-5">
                  <Eyebrow>Architect of record</Eyebrow>
                  <Link to={`/architects/${project.architectSlug}`} className="mt-3 flex items-center gap-3">
                    <img
                      src={architectPortrait}
                      alt={architectName}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <span>
                      <span className="block font-serif text-headline-sm text-ink">{architectName}</span>
                      <span className="block text-body-sm text-stone">{architectFirm}</span>
                    </span>
                  </Link>
                  <VerifiedBadge className="mt-3" />
                </div>
                <div className="space-y-2.5 p-5">
                  <LinkButton to={`/request-demo/${project.architectSlug}`} className="w-full">
                    Request a video demo
                    <Icon name="video_call" className="text-[18px]" />
                  </LinkButton>
                  <LinkButton to={`/architects/${project.architectSlug}`} variant="secondary" className="w-full">
                    View the monograph
                  </LinkButton>
                </div>
                <div className="border-t border-hairline px-5 py-4 text-body-sm text-stone">
                  <p className="flex items-center gap-2">
                    <Icon name="verified_user" className="text-[17px] text-verified" />
                    Verified by the ARCON council
                  </p>
                  <p className="mt-2 flex items-center gap-2">
                    <Icon name="schedule" className="text-[17px] text-stone" />
                    Data updated 12 Feb 2026
                  </p>
                </div>
              </Card>
            </aside>
          </div>

          <div className="mt-14">
            <SectionHeading
              eyebrow="More from the archive"
              title="Related monographs"
              action={
                <LinkButton to="/architects" variant="secondary">
                  Browse all
                  <Icon name="arrow_forward" className="text-[16px]" />
                </LinkButton>
              }
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <ProjectCard key={item.id} project={item} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
