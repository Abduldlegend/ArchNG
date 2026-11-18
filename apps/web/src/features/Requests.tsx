import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { IMG, type DemoRequest } from "../data";
import { useApp } from "../context/context";
import { requestApi } from "../lib/api";
import { PageHeader } from "../components/layout";
import { RequestCard } from "../components/cards";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Eyebrow,
  Icon,
  LinkButton,
  StatusPill,
  Stepper,
  Tabs,
  VerifiedBadge,
} from "../components/ui";

const tabs = [
  { id: "all", label: "All requests" },
  { id: "Requested", label: "Requested" },
  { id: "Accepted", label: "Accepted" },
  { id: "Completed", label: "Completed" },
  { id: "Declined", label: "Declined" },
  { id: "Cancelled", label: "Cancelled" },
];

export function MyRequests() {
  const { requests, signedIn } = useApp();
  const [tab, setTab] = useState("all");

  if (!signedIn) return <Navigate to="/signin?next=/requests" replace />;

  const filtered = tab === "all" ? requests : requests.filter((request) => request.status === tab);
  const counts = Object.fromEntries(
    tabs.map((item) => [
      item.id,
      item.id === "all" ? requests.length : requests.filter((request) => request.status === item.id).length,
    ]),
  );

  return (
    <>
      <PageHeader
        eyebrow="Client portal"
        title="My requests"
        description="Track outgoing consultation requests, accepted dossiers, and completed commissions."
        action={<LinkButton to="/architects" variant="secondary">New request</LinkButton>}
      />
      <section className="py-8 md:py-12">
        <div className="container-page">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-3">
            <Tabs
              items={tabs.map((item) => ({ ...item, count: counts[item.id] }))}
              value={tab}
              onChange={setTab}
              className="border-b-0"
            />
            <span className="hidden text-body-sm text-stone sm:inline">Response window: 72 hours</span>
          </div>

          {filtered.length > 0 ? (
            <div className="mt-6 space-y-4">
              {filtered.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <EmptyState
                icon="drafts"
                title="No requests in this view"
                description="When you request a video demo, the commission brief will appear here with its status and next milestone."
                action={<LinkButton to="/architects">Discover verified practices</LinkButton>}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function RequestDetail() {
  const { id = "" } = useParams();
  const { requests, getArchitect, notify, signedIn, cancelRequest } = useApp();
  const [request, setRequest] = useState<DemoRequest | undefined>(() =>
    requests.find((item) => item.id === id),
  );
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    const cached = requests.find((item) => item.id === id);
    if (cached) setRequest(cached);
    setLoading(true);
    void requestApi
      .get(id)
      .then((result) => {
        if (active) setRequest(result);
      })
      .catch(() => {
        if (active && !cached) setRequest(undefined);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (!signedIn) return <Navigate to={`/signin?next=/requests/${id}`} replace />;

  if (!request && loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-hairline border-t-terracotta" />
        <p className="mt-4 text-body-sm text-stone">Opening your request.</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon="description"
          title="Request not found"
          description="This request reference is not in your portal. It may have been archived."
          action={<LinkButton to="/requests">Back to my requests</LinkButton>}
        />
      </div>
    );
  }

  const architect = getArchitect(request.architectSlug);
  const firm = architect?.firm ?? request.providerFirm ?? "Verified practice";
  const principal = architect?.name ?? request.providerName ?? firm;
  const portrait = architect?.portrait ?? request.providerPortrait ?? IMG.portraitA;
  const contactEmail = request.providerContact?.email ?? architect?.contact?.email ?? "Not shared";
  const cover = architect?.cover || IMG.rammedEarth;
  const current = request.status === "Accepted" ? 1 : request.status === "Completed" ? 2 : 0;
  const unlocked = request.status === "Accepted" || request.status === "Completed";

  const handleCancel = async () => {
    if (!window.confirm("Cancel this consultation request?")) return;
    setCancelling(true);
    try {
      const updated = await cancelRequest(request.id);
      setRequest(updated);
      notify("Request cancelled.");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not cancel this request.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className="border-b border-hairline bg-surface-low/60">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-4 text-body-sm text-stone">
          <div className="flex items-center gap-2">
            <Link to="/requests" className="hover:text-terracotta">
              My requests
            </Link>
            <Icon name="chevron_right" className="text-[15px]" />
            <span className="tnum text-ink">{request.id.toUpperCase()}</span>
          </div>
          <StatusPill status={request.status} />
        </div>
      </div>

      <section className="py-8 md:py-12">
        <div className="container-page grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <Eyebrow>Commission request</Eyebrow>
            <h1 className="mt-3 font-serif text-headline-xl text-ink">
              {request.projectType} · {request.state}
            </h1>
            <p className="mt-2 text-body text-stone">
              Submitted {request.createdAt} · Budget <span className="tnum">{request.budget}</span>
            </p>

            <Card className="mt-6 p-5">
              <Stepper steps={["Requested", "Accepted", "Completed"]} current={current} />
            </Card>

            {unlocked && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-verified/30 bg-verified-soft px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-verified text-white">
                    <Icon name="lock_open" className="text-[20px]" />
                  </span>
                  <div>
                    <p className="text-label text-verified">Accepted client access</p>
                    <p className="text-body-sm text-verified/80">The full dossier and studio contact desk are unlocked.</p>
                  </div>
                </div>
                <Badge tone="verified">Unlocked</Badge>
              </div>
            )}

            <div className="mt-6 rounded-panel border border-hairline bg-card p-5">
              <Eyebrow>Your brief</Eyebrow>
              <p className="mt-3 text-body text-stone">{request.brief}</p>
            </div>

            <div className="mt-6 overflow-hidden rounded-panel border border-hairline">
              <div className="relative">
                <img
                  src={cover}
                  alt=""
                  className={`aspect-[16/9] w-full object-cover ${unlocked ? "" : "blur-[5px]"}`}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink/45 p-6 text-center">
                  {unlocked ? (
                    <>
                      {request.video?.url ? (
                        <a
                          href={request.video.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-terracotta shadow-lift"
                        >
                          <Icon name="play_arrow" filled className="text-[32px]" />
                        </a>
                      ) : (
                        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-terracotta shadow-lift">
                          <Icon name="play_arrow" filled className="text-[32px]" />
                        </span>
                      )}
                      <p className="mt-3 font-serif text-headline-sm text-white">Studio technical walkthrough</p>
                      <p className="text-body-sm text-white/70">
                        {request.video?.url ? "Unlocked by acceptance" : "The studio will share the walkthrough link"}
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/60 text-white">
                        <Icon name="lock" />
                      </span>
                      <p className="mt-3 font-serif text-headline-sm text-white">Walkthrough locked</p>
                      <p className="mt-1 max-w-sm text-body-sm text-white/70">
                        Available once the studio accepts this request.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {request.note && (
              <Card className="mt-6 p-5">
                <Eyebrow>Note from the studio</Eyebrow>
                <p className="mt-3 border-l-2 border-terracotta pl-4 font-serif text-headline-sm leading-snug text-ink">
                  “{request.note}”
                </p>
              </Card>
            )}

            {unlocked && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["chat", "WhatsApp channel", request.providerContact?.whatsapp ?? "Not shared"],
                  ["event", "Studio line", request.providerContact?.phone ?? "Not shared"],
                  ["mail", "Email the principal", contactEmail],
                  ["apartment", "CAD plate archive", "Request from the studio"],
                ].map(([icon, label, detail]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => notify(`${label}: ${detail}`)}
                    className="flex items-center gap-3 rounded-lg border border-hairline bg-card px-4 py-3 text-left transition-colors hover:border-ink"
                  >
                    <Icon name={icon} className="text-[19px] text-terracotta" />
                    <span>
                      <span className="block text-label text-ink">{label}</span>
                      <span className="block text-body-sm text-stone">{detail}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {(request.status === "Declined" || request.status === "Cancelled") && (
              <div className="mt-6 rounded-lg border border-danger/20 bg-danger-soft px-5 py-4">
                <p className="flex items-center gap-2 text-label text-danger">
                  <Icon name="info" className="text-[18px]" />
                  {request.status === "Declined" ? "The studio declined this request" : "This request was cancelled"}
                </p>
                <p className="mt-1 text-body-sm text-danger/80">
                  You can return to the directory and submit a request to another verified practice.
                </p>
              </div>
            )}
          </div>

          <aside>
            <Card className="lg:sticky lg:top-24">
              <div className="border-b border-hairline p-5">
                <Eyebrow>Selected practice</Eyebrow>
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={portrait}
                    alt={principal}
                    className="h-12 w-12 rounded-lg border border-hairline object-cover"
                  />
                  <div>
                    <p className="font-serif text-headline-sm text-ink">{firm}</p>
                    <p className="text-body-sm text-stone">{architect?.city ?? request.state}</p>
                  </div>
                </div>
                <VerifiedBadge className="mt-3" />
              </div>
              <dl className="space-y-3 p-5 text-body-sm">
                {[
                  ["Principal", principal],
                  ["ARCON", architect?.arcon ?? "Verified"],
                  ["Project", request.projectType],
                  ["Budget", request.budget],
                  ["Status", request.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-hairline pb-2 last:border-0 last:pb-0">
                    <dt className="text-stone">{label}</dt>
                    <dd className="text-right text-ink tnum">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="space-y-2 border-t border-hairline p-5">
                <LinkButton to={`/architects/${request.architectSlug}`} variant="secondary" className="w-full">
                  View practice monograph
                </LinkButton>
                {request.status === "Requested" && (
                  <Button variant="ghost" className="w-full" onClick={handleCancel} disabled={cancelling}>
                    <Icon name="cancel" className="text-[17px]" />
                    {cancelling ? "Cancelling…" : "Cancel request"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(request.id)
                      .then(() => notify("Request reference copied."))
                      .catch(() => notify(`Request reference: ${request.id}`));
                  }}
                >
                  <Icon name="content_copy" className="text-[17px]" />
                  Copy reference
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}

