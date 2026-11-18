import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/layout";
import { useApp } from "../context/context";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Icon,
  LinkButton,
  ProgressBar,
  SkeletonCard,
  Tabs,
} from "../components/ui";

const views = [
  { id: "directory", label: "Directory no results" },
  { id: "requests", label: "Requests empty" },
  { id: "loading", label: "Loading skeleton" },
  { id: "upload", label: "Upload failed" },
  { id: "404", label: "404 not found" },
];

export function SystemStates() {
  const [view, setView] = useState("directory");
  const [retry, setRetry] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const { notify } = useApp();

  const startRetry = () => {
    if (retrying) return;
    setRetrying(true);
    setRetry(0);
    window.setTimeout(() => {
      setRetry(100);
      setRetrying(false);
      notify("Upload recovered. Plate queued for conversion.");
    }, 900);
  };

  return (
    <>
      <PageHeader
        eyebrow="System states suite"
        title="Fallback &amp; edge state coverage"
        description="The five canonical states used across the platform: zero results, empty portal, loading, failed upload, and 404."
        action={<Badge>5 states</Badge>}
      />
      <section className="py-8 md:py-12">
        <div className="container-page">
          <Tabs items={views} value={view} onChange={setView} />

          <div className="mt-6">
            {view === "directory" && (
              <EmptyState
                title="No practices match this brief"
                description="We could not find a verified ARCON practice for “rammed earth chapel in Lekki”. Try a broader location or remove a filter."
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <LinkButton to="/architects">Reset search</LinkButton>
                    <LinkButton to="/architects" variant="secondary">
                      Browse all practices
                    </LinkButton>
                  </div>
                }
              />
            )}

            {view === "requests" && (
              <EmptyState
                icon="drafts"
                title="No commission requests yet"
                description="Discover a verified practice and submit a short brief. Accepted requests unlock the full monograph and direct studio contact."
                action={
                  <LinkButton to="/architects">
                    Discover verified practices
                    <Icon name="arrow_forward" className="text-[16px]" />
                  </LinkButton>
                }
              />
            )}

            {view === "loading" && (
              <div>
                <div className="mb-4 flex items-center gap-2 text-body-sm text-stone">
                  <Icon name="progress_activity" className="animate-spin text-[18px] text-terracotta" />
                  Loading the verified directory…
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              </div>
            )}

            {view === "upload" && (
              <div className="mx-auto max-w-xl">
                <Card className="p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-soft text-danger">
                      <Icon name="cloud_off" className="text-[21px]" />
                    </span>
                    <div>
                      <h3 className="font-serif text-headline-sm text-ink">Plate upload interrupted</h3>
                      <p className="mt-1 text-body-sm text-stone">
                        The network dropped while converting <span className="text-ink">plate-05-courtyard-section.pdf</span>.
                        Your existing plates are safe.
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 rounded-lg border border-hairline bg-surface-low p-4">
                    <div className="flex items-center justify-between text-body-sm">
                      <span className="text-ink">Retry conversion</span>
                      <span className="text-stone tnum">{retry}%</span>
                    </div>
                    <ProgressBar value={retry} className="mt-2" />
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Button onClick={startRetry} disabled={retrying}>
                      <Icon name="refresh" className="text-[17px]" />
                      {retrying ? "Retrying…" : "Retry upload"}
                    </Button>
                    <Button variant="secondary" onClick={() => notify("Upload cancelled. No changes were saved.")}>
                      Cancel upload
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {view === "404" && <NotFoundState />}
          </div>
        </div>
      </section>
    </>
  );
}

function NotFoundState() {
  return (
    <div className="relative overflow-hidden rounded-panel border border-hairline bg-card blueprint-grid">
      <div className="relative mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        <span className="font-serif text-[88px] leading-none text-hairline-strong tnum">404</span>
        <Eyebrow className="mt-2">Plate not found</Eyebrow>
        <h2 className="mt-3 font-serif text-headline-lg text-ink">This page is not in the archive.</h2>
        <p className="mt-3 text-body text-stone">
          The monograph may have been withdrawn, or the link is incomplete. Return to the registry to continue
          browsing verified practices.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <LinkButton to="/">
            Return home
            <Icon name="arrow_forward" className="text-[16px]" />
          </LinkButton>
          <LinkButton to="/architects" variant="secondary">
            Browse the directory
          </LinkButton>
        </div>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <section className="py-14 md:py-20">
      <div className="container-page">
        <NotFoundState />
        <p className="mt-6 text-center text-body-sm text-stone">
          Looking for the full suite of edge states?{" "}
          <Link to="/system-states" className="text-terracotta hover:underline">
            View the system states suite
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
