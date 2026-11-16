import { useState } from "react";
import { Link } from "react-router-dom";
import { activityFeed, verificationSeed } from "../data";
import { useApp } from "../context/context";
import { PageHeader } from "../components/layout";
import { formatDate } from "../lib/format";
import { cn } from "../lib/cn";
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Eyebrow,
  Field,
  Icon,
  LinkButton,
  Tabs,
  Textarea,
  VerifiedBadge,
} from "../components/ui";

const metrics = [
  { label: "Registered users", value: "4,892", delta: "+182 this quarter", icon: "group" },
  { label: "Verified practices", value: "348", delta: "96% licence current", icon: "verified_user" },
  { label: "Published monographs", value: "1,284", delta: "+46 this month", icon: "auto_stories" },
  { label: "Monitored commissions", value: "92", delta: "₦18.4B active capital", icon: "account_balance" },
];

export function AdminDashboard() {
  const { verification } = useApp();
  const pending = verification.filter((item) => item.status === "Pending");

  return (
    <>
      <PageHeader
        eyebrow="ARCON council console"
        title="Statutory registry overview"
        description="Live oversight of practitioner licensing, published monographs, and monitored commission capital across all active chapters."
        action={
          <div className="flex items-center gap-3">
            <VerifiedBadge label="Registrar access" />
            <LinkButton to="/admin/verification" variant="dark" size="sm">
              Open verification queue
              <Icon name="arrow_forward" className="text-[15px]" />
            </LinkButton>
          </div>
        }
      />

      <div className="container-page space-y-6 py-8 md:py-10">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-caps uppercase tracking-[0.07em] text-stone-soft">{metric.label}</span>
                <Icon name={metric.icon} className="text-[20px] text-terracotta" />
              </div>
              <p className="mt-2 font-serif text-headline-lg text-ink tnum">{metric.value}</p>
              <p className="mt-1 text-body-sm text-stone">{metric.delta}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-5 py-4">
                <div>
                  <Eyebrow>Verification queue</Eyebrow>
                  <h2 className="mt-1 font-serif text-headline-sm text-ink">Pending practitioner filings</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="warning">{pending.length} pending</Badge>
                  <Link to="/admin/verification" className="text-body-sm text-terracotta hover:underline">
                    View all
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-hairline">
                {pending.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-stone">
                        <Icon name="person" className="text-[18px]" />
                      </span>
                      <div>
                        <p className="text-label text-ink">{item.name}</p>
                        <p className="text-body-sm text-stone">
                          {item.firm} · {item.arcon}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={item.sla.includes("breached") ? "danger" : "warning"}>
                        <Icon name="timer" className="text-[14px]" />
                        {item.sla}
                      </Badge>
                      <Link to="/admin/verification" className="text-body-sm text-terracotta hover:underline">
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="p-5">
                <Eyebrow>Chapter monitor</Eyebrow>
                <h2 className="mt-1 font-serif text-headline-sm text-ink">Territorial load</h2>
                <div className="mt-4 space-y-3">
                  {[
                    ["Lagos", 84],
                    ["Abuja FCT", 67],
                    ["Port Harcourt", 51],
                    ["Ibadan", 38],
                    ["Enugu", 26],
                  ].map(([chapter, value]) => (
                    <div key={String(chapter)}>
                      <div className="flex items-center justify-between text-body-sm">
                        <span className="text-stone">{chapter}</span>
                        <span className="text-ink tnum">{value}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sand">
                        <div className="h-full rounded-full bg-terracotta" style={{ width: `${value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <Eyebrow>Registry health</Eyebrow>
                <h2 className="mt-1 font-serif text-headline-sm text-ink">Statutory checks</h2>
                <ul className="mt-4 space-y-3 text-body-sm">
                  {[
                    ["Form B renewals current", true],
                    ["Indemnity cover on file", true],
                    ["Pending SLA escalation", false],
                    ["Monograph audit backlog", false],
                  ].map(([label, ok]) => (
                    <li key={String(label)} className="flex items-center justify-between gap-3 border-b border-hairline pb-2 last:border-0 last:pb-0">
                      <span className="text-stone">{label}</span>
                      <Badge tone={ok ? "verified" : "warning"}>{ok ? "Clear" : "Review"}</Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <div className="border-b border-hairline px-5 py-4">
                <Eyebrow>Council activity</Eyebrow>
                <h2 className="mt-1 font-serif text-headline-sm text-ink">Real-time registry feed</h2>
              </div>
              <ol className="divide-y divide-hairline">
                {activityFeed.map((item) => (
                  <li key={item.title} className="flex items-start gap-3 px-5 py-4">
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        item.tone === "verified" ? "bg-verified" : item.tone === "warning" ? "bg-warning" : "bg-stone-soft",
                      )}
                    />
                    <div className="flex-1">
                      <p className="text-body-sm text-ink">{item.title}</p>
                      <p className="text-body-sm text-stone">{item.detail}</p>
                    </div>
                    <span className="shrink-0 text-body-sm text-stone-soft">{item.time}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <Eyebrow>Registrar profile</Eyebrow>
              <div className="mt-3 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ink font-serif text-headline-sm text-white">
                  AB
                </span>
                <div>
                  <p className="text-label text-ink">A. Bello</p>
                  <p className="text-body-sm text-stone">Registrar · Council secretariat</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-body-sm">
                {[
                  ["Term", "2024 – 2028"],
                  ["Chapters", "5 active"],
                  ["SLA window", "72 hours"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-hairline pb-2 last:border-0 last:pb-0">
                    <span className="text-stone">{label}</span>
                    <span className="text-ink tnum">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-ink p-5 text-white">
              <Eyebrow className="text-white/50">Statutory notice</Eyebrow>
              <p className="mt-2 font-serif text-headline-sm text-white">Form B renewals close 31 March 2026.</p>
              <p className="mt-2 text-body-sm text-white/65">
                Practices that have not filed will be suspended from the public directory until the licence is
                restored.
              </p>
              <Badge className="mt-4 border-white/20 bg-white/10 text-white">CAP A19 LFN 2004</Badge>
            </Card>

            <Card className="p-5">
              <Eyebrow>Quick dossiers</Eyebrow>
              <div className="mt-3 space-y-2">
                {verificationSeed.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to="/admin/verification"
                    className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-3 py-2.5 text-body-sm hover:border-ink"
                  >
                    <span className="truncate text-stone">{item.firm}</span>
                    <Icon name="arrow_outward" className="text-[16px] text-stone" />
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

export function VerificationQueue() {
  const { verification, decideVerification } = useApp();
  const [tab, setTab] = useState("Pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const selected = verification.find((item) => item.id === selectedId);
  const filtered = verification.filter((item) => item.status === tab);

  const openCase = (id: string) => {
    setSelectedId(id);
    setReason("");
    setError("");
  };

  const closeCase = () => {
    setSelectedId(null);
    setReason("");
    setError("");
  };

  const approve = () => {
    if (!selected) return;
    decideVerification(selected.id, "Verified");
    closeCase();
  };

  const reject = () => {
    if (!selected) return;
    if (reason.trim().length < 12) {
      setError("Provide a statutory rejection reason of at least 12 characters.");
      return;
    }
    decideVerification(selected.id, "Rejected");
    closeCase();
  };

  return (
    <>
      <PageHeader
        eyebrow="ARCON verification queue"
        title="Practitioner licensing & Form B review"
        description="Inspect statutory filings, verify annual practising licences, and approve or reject practitioner dossiers."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="warning">
              <Icon name="timer" className="text-[14px]" />
              72-hour SLA
            </Badge>
            <Badge tone="danger">1 escalated</Badge>
          </div>
        }
      />

      <div className="container-page py-8 md:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Tabs
            items={[
              { id: "Pending", label: "Pending", count: verification.filter((item) => item.status === "Pending").length },
              { id: "Verified", label: "Verified", count: verification.filter((item) => item.status === "Verified").length },
              { id: "Rejected", label: "Rejected", count: verification.filter((item) => item.status === "Rejected").length },
            ]}
            value={tab}
            onChange={setTab}
            className="flex-1"
          />
          <Button variant="secondary" size="sm" onClick={() => setTab("Pending")}>
            <Icon name="filter_alt" className="text-[16px]" />
            Reset view
          </Button>
        </div>

        {filtered.length > 0 ? (
          <Card className="mt-5 overflow-hidden">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left text-body-sm">
                <thead className="bg-surface-low text-caps uppercase tracking-[0.06em] text-stone-soft">
                  <tr>
                    <th className="px-5 py-3 font-medium">Practitioner</th>
                    <th className="px-5 py-3 font-medium">ARCON</th>
                    <th className="px-5 py-3 font-medium">Chapter</th>
                    <th className="px-5 py-3 font-medium">Submitted</th>
                    <th className="px-5 py-3 font-medium">SLA</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item.id} className="border-t border-hairline bg-card">
                      <td className="px-5 py-4">
                        <p className="text-ink">{item.name}</p>
                        <p className="text-stone">{item.firm}</p>
                      </td>
                      <td className="px-5 py-4 text-stone tnum">{item.arcon.replace("ARCON ", "")}</td>
                      <td className="px-5 py-4 text-stone">{item.city}</td>
                      <td className="px-5 py-4 text-stone tnum">{formatDate(item.submitted)}</td>
                      <td className="px-5 py-4">
                        <Badge tone={item.sla.includes("breached") ? "danger" : item.status === "Pending" ? "warning" : "verified"}>
                          {item.sla}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <Badge tone={item.status === "Verified" ? "verified" : item.status === "Rejected" ? "danger" : "warning"}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="secondary" size="sm" onClick={() => openCase(item.id)}>
                          Review dossier
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-hairline md:hidden">
              {filtered.map((item) => (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-label text-ink">{item.name}</p>
                      <p className="text-body-sm text-stone">{item.firm}</p>
                    </div>
                    <Badge tone={item.status === "Verified" ? "verified" : item.status === "Rejected" ? "danger" : "warning"}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-stone">
                    <span className="tnum">{item.arcon}</span>
                    <span>{item.city}</span>
                    <span className="tnum">{formatDate(item.submitted)}</span>
                    <span className={cn(item.sla.includes("breached") && "text-danger")}>{item.sla}</span>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-3 w-full" onClick={() => openCase(item.id)}>
                    Review dossier
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="mt-5">
            <EmptyState
              icon="verified_user"
              title={`No ${tab.toLowerCase()} filings`}
              description="The verification queue is clear for this view. New practitioner filings will appear here automatically."
            />
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selected)}
        onClose={closeCase}
        title={selected ? `${selected.name} · ${selected.firm}` : "Dossier"}
        subtitle={selected ? `${selected.arcon} · ${selected.city} chapter` : undefined}
        width="max-w-2xl"
        footer={
          selected?.status === "Pending" ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button variant="danger" onClick={reject}>
                <Icon name="cancel" className="text-[17px]" />
                Reject filing
              </Button>
              <Button onClick={approve}>
                <Icon name="verified" className="text-[17px]" />
                Approve &amp; verify
              </Button>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeCase}>
                Close
              </Button>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["Submitted", formatDate(selected.submitted)],
                ["SLA", selected.sla],
                ["Status", selected.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-hairline bg-surface-low p-3">
                  <p className="text-caps uppercase tracking-[0.06em] text-stone-soft">{label}</p>
                  <p className="mt-1 text-body-sm text-ink">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <Eyebrow>Statutory documents</Eyebrow>
              <ul className="mt-2 space-y-2">
                {selected.documents.map((document) => (
                  <li key={document} className="flex items-center justify-between gap-3 rounded-lg border border-hairline px-4 py-3">
                    <span className="flex items-center gap-2 text-body-sm text-ink">
                      <Icon name="picture_as_pdf" className="text-[18px] text-danger" />
                      {document}
                    </span>
                    <Badge tone="verified">On file</Badge>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Eyebrow>Form B preview</Eyebrow>
              <div className="mt-2 overflow-hidden rounded-lg border border-hairline bg-surface-low">
                <div className="flex items-center justify-between gap-3 border-b border-hairline bg-card px-4 py-3">
                  <span className="flex items-center gap-2 text-body-sm text-ink">
                    <Icon name="description" className="text-[18px] text-terracotta" />
                    ARCON Form B · 2026 annual practising licence
                  </span>
                  <span className="text-caps uppercase tracking-[0.06em] text-stone-soft">Preview</span>
                </div>
                <div className="relative mx-auto max-w-md p-6">
                  <div className="rounded border border-hairline bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                      <span className="font-serif text-headline-sm text-ink">ARCON</span>
                      <span className="text-[10px] uppercase tracking-[0.1em] text-stone-soft">Federal Republic of Nigeria</span>
                    </div>
                    <p className="mt-4 text-caps uppercase tracking-[0.08em] text-stone-soft">Annual practising licence</p>
                    <p className="mt-2 font-serif text-headline-sm text-ink">{selected.name}</p>
                    <p className="text-body-sm text-stone">{selected.firm}</p>
                    <dl className="mt-4 space-y-1.5 text-body-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone">Registration</dt>
                        <dd className="text-ink tnum">{selected.arcon}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone">Chapter</dt>
                        <dd className="text-ink">{selected.city}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-stone">Validity</dt>
                        <dd className="text-ink tnum">01 Jan – 31 Dec 2026</dd>
                      </div>
                    </dl>
                    <div className="mt-5 flex items-center justify-between border-t border-hairline pt-3">
                      <span className="text-[10px] uppercase tracking-[0.08em] text-stone-soft">Registrar signature</span>
                      <span className="font-serif text-headline-sm text-verified">A. Bello</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selected.status === "Pending" && (
              <Field label="Rejection reason" hint="Required only when rejecting">
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="State the statutory ground for rejection and the corrective action required…"
                  className="min-h-24"
                />
              </Field>
            )}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-body-sm text-danger">
                <Icon name="error" className="text-[18px]" />
                {error}
              </div>
            )}
          </div>
        )}
      </Dialog>
    </>
  );
}
