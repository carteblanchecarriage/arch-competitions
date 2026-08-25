"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  getOrganizerDashboard,
  getCompetitionEntries,
  updateCompetitionDeadline,
  type OrganizerCompetition,
  type DashboardEntry,
} from "@/app/actions/organizer";
import { publishCompetition } from "@/app/actions/competition";
import { FundCompetitionPanel } from "@/components/detail/FundCompetitionPanel";
import { OrganizerQAPanel } from "@/components/competitions/OrganizerQAPanel";
import { AnnounceWinnersPanel } from "@/components/competitions/AnnounceWinnersPanel";
import { OrganizerJuryPanel } from "@/components/competitions/OrganizerJuryPanel";
import { formatDate, formatCurrency } from "@/lib/utils";

type PageState =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "unauthorized" }
  | { kind: "ready" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  open: "Open",
  judging: "Judging",
  announced: "Announced",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  open: "bg-emerald-50 text-emerald-700",
  judging: "bg-amber-50 text-amber-700",
  announced: "bg-gray-100 text-gray-600",
};

export default function OrganizerDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();

  const [pageState, setPageState] = useState<PageState>({ kind: "loading" });
  const [competitions, setCompetitions] = useState<OrganizerCompetition[]>([]);
  const [organizerSlug, setOrganizerSlug] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishingSlug, setPublishingSlug] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<Record<string, string>>({});
  const [deadlineEdit, setDeadlineEdit] = useState<Record<string, string>>({});
  const [savingDeadline, setSavingDeadline] = useState<string | null>(null);
  const [deadlineError, setDeadlineError] = useState<Record<string, string>>({});

  // Load dashboard on auth
  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { setPageState({ kind: "unauthenticated" }); return; }

    (async () => {
      const token = await getAccessToken();
      if (!token) { setPageState({ kind: "unauthenticated" }); return; }

      try {
        const dashboard = await getOrganizerDashboard(token);
        // Verify the logged-in organizer matches the slug in the URL
        if (dashboard.organizerSlug !== params.slug) {
          setPageState({ kind: "unauthorized" });
          return;
        }
        setOrganizerSlug(dashboard.organizerSlug);
        setCompetitions(dashboard.competitions);
        setPageState({ kind: "ready" });

        // Auto-select the first live competition
        const firstLive = dashboard.competitions.find((c) => c.status !== "draft");
        if (firstLive) {
          loadEntries(token, firstLive.id);
          setSelectedId(firstLive.id);
        }
      } catch {
        setPageState({ kind: "unauthorized" });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  async function loadEntries(token: string, competitionId: string) {
    setLoadingEntries(true);
    setError(null);
    try {
      const data = await getCompetitionEntries(token, competitionId);
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load entries.");
    } finally {
      setLoadingEntries(false);
    }
  }

  async function handleSelectCompetition(comp: OrganizerCompetition) {
    if (comp.id === selectedId) return;
    setSelectedId(comp.id);
    setEntries([]);
    const token = await getAccessToken();
    if (token) loadEntries(token, comp.id);
  }

  const draftComps = competitions.filter((c) => c.status === "draft");
  const liveComps = competitions.filter((c) => c.status !== "draft");
  const selectedComp = liveComps.find((c) => c.id === selectedId);
  const submitted = entries.filter((e) => e.status === "submitted");
  const drafts = entries.filter((e) => e.status === "draft");

  async function handleAnnounced() {
    const token = await getAccessToken();
    if (!token) return;
    const dashboard = await getOrganizerDashboard(token);
    setCompetitions(dashboard.competitions);
  }

  async function handlePublish(slug: string) {
    setPublishingSlug(slug);
    setPublishError((prev) => ({ ...prev, [slug]: "" }));
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      await publishCompetition(token, slug);
      // Refresh competitions list
      const dashboard = await getOrganizerDashboard(token);
      setCompetitions(dashboard.competitions);
    } catch (e) {
      setPublishError((prev) => ({
        ...prev,
        [slug]: e instanceof Error ? e.message : "Failed to publish.",
      }));
    } finally {
      setPublishingSlug(null);
    }
  }

  async function handleDeadlineUpdate(comp: OrganizerCompetition) {
    const newDeadline = deadlineEdit[comp.id];
    if (!newDeadline) return;
    setSavingDeadline(comp.id);
    setDeadlineError((prev) => ({ ...prev, [comp.id]: "" }));
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      await updateCompetitionDeadline(token, comp.id, newDeadline);
      const dashboard = await getOrganizerDashboard(token);
      setCompetitions(dashboard.competitions);
      setDeadlineEdit((prev) => ({ ...prev, [comp.id]: "" }));
    } catch (e) {
      setDeadlineError((prev) => ({
        ...prev,
        [comp.id]: e instanceof Error ? e.message : "Failed to update deadline.",
      }));
    } finally {
      setSavingDeadline(null);
    }
  }

  function deadlineEditRules(comp: OrganizerCompetition): string {
    const createdAt = new Date(comp.createdAt).getTime();
    const withinGrace = Date.now() - createdAt < 24 * 60 * 60 * 1000;
    if (withinGrace) return "Within the first 24 hours — any changes allowed.";
    const maxDate = new Date(
      new Date(comp.originalSubmissionDeadline).getTime() + 90 * 24 * 60 * 60 * 1000
    ).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `Can extend up to ${maxDate} (3 months from original).`;
  }

  // ── render states ────────────────────────────────────────────────────

  if (pageState.kind === "loading") {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (pageState.kind === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizer dashboard</h1>
        <p className="mt-3 text-gray-500">Sign in to view your submissions.</p>
        <Button onClick={login} className="mt-6">Sign in</Button>
      </div>
    );
  }

  if (pageState.kind === "unauthorized") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
        <p className="mt-3 text-gray-500">
          This dashboard belongs to a different organizer account.
        </p>
        <Link href="/" className="mt-6 inline-block text-sm text-gray-500 underline">
          Go home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link
            href={`/organizers/${organizerSlug}`}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            ← Public profile
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Submissions</h1>
        </div>
      </div>

      {competitions.length === 0 ? (
        <div className="border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-gray-500">No competitions yet.</p>
          <Link href="/create">
            <Button className="mt-4">Create a competition</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Draft competitions */}
          {draftComps.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-500">
                Drafts — fund to go live
              </h2>
              <div className="space-y-4">
                {draftComps.map((c) => (
                  <div key={c.id} className="border border-dashed border-gray-300 bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{c.title}</h3>
                        <p className="mt-0.5 text-sm text-gray-500">
                          {c.isOpenPool ? "Open pool" : formatCurrency(c.totalAmount)} · deadline {formatDate(c.submissionDeadline)}
                        </p>
                      </div>
                      <Link
                        href={`/competitions/${c.slug}`}
                        className="shrink-0 text-xs text-gray-400 hover:text-gray-700"
                      >
                        Preview →
                      </Link>
                    </div>

                    {c.escrowAddress ? (
                      <div className="mt-4">
                        <p className="mb-1 text-xs font-medium text-gray-600">
                          {c.isOpenPool
                            ? "Deposit any amount to go live:"
                            : `Deposit ${formatCurrency(c.totalAmount)} USDC to go live:`}
                        </p>
                        <FundCompetitionPanel
                          escrowAddress={c.escrowAddress}
                          chainId={c.chainId ?? undefined}
                          initialAmount={c.isOpenPool ? undefined : String(c.totalAmount)}
                        />
                      </div>
                    ) : (
                      <div className="mt-3 border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                        No escrow deployed. Make sure <code className="font-mono">DEPLOYER_PRIVATE_KEY</code> is set and re-create this competition.
                      </div>
                    )}

                    {/* Deadline edit */}
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <p className="mb-1.5 text-xs font-medium text-gray-600">Change deadline</p>
                      <p className="mb-2 text-[11px] text-gray-400">{deadlineEditRules(c)}</p>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={deadlineEdit[c.id] ?? ""}
                          onChange={(e) => setDeadlineEdit((prev) => ({ ...prev, [c.id]: e.target.value }))}
                          className="border border-gray-200 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeadlineUpdate(c)}
                          disabled={!deadlineEdit[c.id] || savingDeadline === c.id}
                        >
                          {savingDeadline === c.id ? "Saving…" : "Update"}
                        </Button>
                      </div>
                      {deadlineError[c.id] && (
                        <p className="mt-1.5 text-xs text-red-600">{deadlineError[c.id]}</p>
                      )}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <Button
                        size="sm"
                        onClick={() => handlePublish(c.slug)}
                        disabled={publishingSlug === c.slug || !c.escrowAddress}
                        className="w-full sm:w-auto"
                      >
                        {publishingSlug === c.slug ? "Publishing…" : "Publish Competition"}
                      </Button>
                      {publishError[c.slug] && (
                        <p className="mt-2 text-xs text-red-600">{publishError[c.slug]}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live competition selector */}
          {liveComps.length > 0 && (
          <div className="space-y-6">
          {draftComps.length > 0 && (
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Live Competitions</h2>
          )}
          <div className="flex flex-wrap gap-2">
            {liveComps.map((c) => (
              <button
                key={c.id}
                onClick={() => handleSelectCompetition(c)}
                className={`flex items-center gap-2 border px-4 py-2.5 text-sm transition-colors ${
                  c.id === selectedId
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                }`}
              >

                <span className="font-medium">{c.title}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium ${
                    c.id === selectedId
                      ? "bg-white/20 text-white"
                      : STATUS_COLOR[c.status]
                  }`}
                >
                  {c.entryCount} {c.entryCount === 1 ? "entry" : "entries"}
                </span>
              </button>
            ))}
          </div>

          {/* Entries + Q&A panel */}
          {selectedComp && (
            <div className="border border-gray-200 bg-white">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-gray-900">{selectedComp.title}</h2>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[selectedComp.status]}`}
                  >
                    {STATUS_LABEL[selectedComp.status]}
                  </span>
                </div>
                <Link
                  href={`/competitions/${selectedComp.slug}`}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  View competition →
                </Link>
              </div>

              {/* Deadline edit */}
              {selectedComp.status === "open" && (
                <div className="border-b border-gray-100 px-6 py-4">
                  <p className="mb-1 text-xs font-medium text-gray-600">
                    Deadline: {formatDate(selectedComp.submissionDeadline)}
                  </p>
                  <p className="mb-2 text-[11px] text-gray-400">{deadlineEditRules(selectedComp)}</p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={deadlineEdit[selectedComp.id] ?? ""}
                      onChange={(e) => setDeadlineEdit((prev) => ({ ...prev, [selectedComp.id]: e.target.value }))}
                      className="border border-gray-200 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeadlineUpdate(selectedComp)}
                      disabled={!deadlineEdit[selectedComp.id] || savingDeadline === selectedComp.id}
                    >
                      {savingDeadline === selectedComp.id ? "Saving…" : "Extend"}
                    </Button>
                  </div>
                  {deadlineError[selectedComp.id] && (
                    <p className="mt-1.5 text-xs text-red-600">{deadlineError[selectedComp.id]}</p>
                  )}
                </div>
              )}

              {/* Anonymous judging notice */}
              {selectedComp.status !== "announced" && submitted.length > 0 && (
                <div className="border-b border-gray-100 bg-gray-50 px-6 py-3">
                  <p className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-500">
                    Anonymous judging active — submitter identities are hidden until you announce winners (UIA Accord)
                  </p>
                </div>
              )}

              {/* Entries */}
              {loadingEntries ? (
                <div className="space-y-3 p-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 animate-pulse bg-gray-100" />
                  ))}
                </div>
              ) : error ? (
                <div className="p-6 text-sm text-red-600">{error}</div>
              ) : entries.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-400">
                  No entries yet.
                </div>
              ) : (
                <div>
                  {/* Submitted */}
                  {submitted.length > 0 && (
                    <div>
                      <div className="border-b border-gray-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Submitted — {submitted.length}
                      </div>
                      <EntryTable entries={submitted} announced={selectedComp.status === "announced"} />
                    </div>
                  )}

                  {/* Drafts */}
                  {drafts.length > 0 && (
                    <div className={submitted.length > 0 ? "border-t border-gray-100" : ""}>
                      <div className="border-b border-gray-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        In progress — {drafts.length}
                      </div>
                      <EntryTable entries={drafts} announced={selectedComp.status === "announced"} muted />
                    </div>
                  )}
                </div>
              )}

              {/* Jury management */}
              <div className="border-t border-gray-100">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Jury</h3>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Add or update jurors at any time. Jurors must have a Counterparti account.
                  </p>
                </div>
                <div className="px-6 py-5">
                  <OrganizerJuryPanel
                    competitionId={selectedComp.id}
                    initialJury={selectedComp.jury}
                  />
                </div>
              </div>

              {/* Announce Winners */}
              {selectedComp.status !== "announced" && (
                <div className="border-t border-gray-100">
                  <div className="border-b border-gray-100 px-6 py-4">
                    <h3 className="font-semibold text-gray-900">Select Winners</h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Pick one entry per prize tier. This publishes results publicly.
                    </p>
                  </div>
                  <AnnounceWinnersPanel
                    competition={selectedComp}
                    entries={entries}
                    onAnnounced={handleAnnounced}
                  />
                </div>
              )}

              {/* Q&A */}
              <div className="border-t border-gray-100">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h3 className="font-semibold text-gray-900">Questions</h3>
                </div>
                <OrganizerQAPanel competitionId={selectedComp.id} />
              </div>
            </div>
          )}
          </div>
          )}

        </div>
      )}
    </div>
  );
}

function EntryTable({
  entries,
  announced,
  muted = false,
}: {
  entries: DashboardEntry[];
  announced: boolean;
  muted?: boolean;
}) {
  return (
    <div className="divide-y divide-gray-50">
      {entries.map((e) => (
        <div
          key={e.id}
          className={`flex items-center gap-4 px-6 py-4 ${muted ? "opacity-60" : ""}`}
        >
          {/* Status dot */}
          <div
            className={`h-2 w-2 shrink-0 ${
              e.status === "submitted" ? "bg-emerald-400" : "bg-gray-300"
            }`}
          />

          {/* Anonymous ID */}
          {e.anonymousId && (
            <span className="shrink-0 font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">
              {e.anonymousId}
            </span>
          )}

          {/* Project info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-900">{e.title}</p>
            {e.description && (
              <p className="mt-0.5 truncate text-xs text-gray-400">{e.description}</p>
            )}
          </div>

          {/* Submitter — only shown after announcement */}
          {announced && e.submitter ? (
            <Link
              href={`/submitters/${e.submitter.slug}`}
              className="hidden shrink-0 text-sm text-gray-600 hover:text-gray-900 hover:underline sm:block"
            >
              {e.submitter.name}
            </Link>
          ) : !announced ? (
            <span className="hidden shrink-0 font-mono text-[0.625rem] uppercase tracking-widest text-gray-300 sm:block">
              Identity hidden
            </span>
          ) : null}

          {/* File count */}
          {e.files.length > 0 && (
            <span className="hidden shrink-0 text-xs text-gray-400 sm:block">
              {e.files.length} {e.files.length === 1 ? "file" : "files"}
            </span>
          )}

          {/* Date */}
          <span className="shrink-0 font-mono text-[0.625rem] text-gray-400">
            {e.submittedAt ? formatDate(e.submittedAt) : "Draft"}
          </span>

          {/* Project link */}
          {e.projectUrl && (
            <a
              href={e.projectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs text-gray-400 hover:text-gray-700"
            >
              Link ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
