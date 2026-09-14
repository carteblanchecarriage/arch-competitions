"use client";

import { useEffect, useState, useTransition } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import {
  adminListCompetitions,
  adminSetCompetitionRemoved,
  adminListEntries,
  adminSetEntryRemoved,
  adminListReports,
  adminResolveReport,
  type AdminCompetitionRow,
  type AdminEntryRow,
  type AdminReportRow,
} from "@/app/actions/admin";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

type LoadState<T> =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "error"; message: string }
  | { status: "ready"; rows: T[] };

function RemoveControl({
  removed,
  reason,
  onRemove,
  onRestore,
  busy,
}: {
  removed: boolean;
  reason: string | null;
  onRemove: (reason: string) => void;
  onRestore: () => void;
  busy: boolean;
}) {
  const [showReason, setShowReason] = useState(false);
  const [reasonInput, setReasonInput] = useState("");

  if (removed) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">
          Removed{reason ? ` — ${reason}` : ""}
        </span>
        <Button variant="outline" size="sm" onClick={onRestore} disabled={busy}>
          Restore
        </Button>
      </div>
    );
  }

  if (showReason) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={reasonInput}
          onChange={(e) => setReasonInput(e.target.value)}
          placeholder="Reason (optional)"
          className="w-40 border border-gray-300 px-2 py-1 text-xs focus:border-gray-400 focus:outline-none"
        />
        <Button
          variant="primary"
          size="sm"
          disabled={busy}
          onClick={() => {
            onRemove(reasonInput);
            setShowReason(false);
            setReasonInput("");
          }}
        >
          Confirm
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowReason(false)} disabled={busy}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" size="sm" onClick={() => setShowReason(true)} disabled={busy}>
      Remove
    </Button>
  );
}

function CompetitionsTab({ accessToken }: { accessToken: string }) {
  const [state, setState] = useState<LoadState<AdminCompetitionRow>>({ status: "loading" });
  const [isPending, startTransition] = useTransition();

  function load() {
    adminListCompetitions(accessToken)
      .then((rows) => setState({ status: "ready", rows }))
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        setState(message === "Not authorized." ? { status: "unauthorized" } : { status: "error", message });
      });
  }

  useEffect(load, [accessToken]);

  if (state.status === "loading") return <p className="text-sm text-gray-400">Loading…</p>;
  if (state.status === "unauthorized") return <p className="text-sm text-red-600">Not authorized.</p>;
  if (state.status === "error") return <p className="text-sm text-red-600">{state.message}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
            <th className="py-2 pr-4">Title</th>
            <th className="py-2 pr-4">Organizer</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2">Moderation</th>
          </tr>
        </thead>
        <tbody>
          {state.rows.map((c) => (
            <tr key={c.id} className="border-b border-gray-100">
              <td className="py-2 pr-4">
                <Link href={`/competitions/${c.slug}`} target="_blank" className="font-medium text-gray-900 hover:underline">
                  {c.title}
                </Link>
              </td>
              <td className="py-2 pr-4 text-gray-500">{c.organizerName}</td>
              <td className="py-2 pr-4 text-gray-500">{c.status}</td>
              <td className="py-2 pr-4 text-gray-400">{formatDate(c.createdAt)}</td>
              <td className="py-2">
                <RemoveControl
                  removed={c.adminRemoved}
                  reason={c.adminRemovedReason}
                  busy={isPending}
                  onRemove={(reason) =>
                    startTransition(async () => {
                      await adminSetCompetitionRemoved(accessToken, c.id, true, reason);
                      load();
                    })
                  }
                  onRestore={() =>
                    startTransition(async () => {
                      await adminSetCompetitionRemoved(accessToken, c.id, false);
                      load();
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.rows.length === 0 && <p className="py-6 text-sm text-gray-400">No competitions yet.</p>}
    </div>
  );
}

function EntriesTab({ accessToken }: { accessToken: string }) {
  const [state, setState] = useState<LoadState<AdminEntryRow>>({ status: "loading" });
  const [isPending, startTransition] = useTransition();

  function load() {
    adminListEntries(accessToken)
      .then((rows) => setState({ status: "ready", rows }))
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        setState(message === "Not authorized." ? { status: "unauthorized" } : { status: "error", message });
      });
  }

  useEffect(load, [accessToken]);

  if (state.status === "loading") return <p className="text-sm text-gray-400">Loading…</p>;
  if (state.status === "unauthorized") return <p className="text-sm text-red-600">Not authorized.</p>;
  if (state.status === "error") return <p className="text-sm text-red-600">{state.message}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
            <th className="py-2 pr-4">Entry</th>
            <th className="py-2 pr-4">Competition</th>
            <th className="py-2 pr-4">Submitter</th>
            <th className="py-2 pr-4">Status</th>
            <th className="py-2 pr-4">Submitted</th>
            <th className="py-2">Moderation</th>
          </tr>
        </thead>
        <tbody>
          {state.rows.map((e) => (
            <tr key={e.id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium text-gray-900">{e.title}</td>
              <td className="py-2 pr-4 text-gray-500">
                {e.competitionSlug ? (
                  <Link href={`/competitions/${e.competitionSlug}`} target="_blank" className="hover:underline">
                    {e.competitionTitle}
                  </Link>
                ) : (
                  e.competitionTitle
                )}
              </td>
              <td className="py-2 pr-4 text-gray-500">{e.submitterName}</td>
              <td className="py-2 pr-4 text-gray-500">{e.status}</td>
              <td className="py-2 pr-4 text-gray-400">{formatDate(e.createdAt)}</td>
              <td className="py-2">
                <RemoveControl
                  removed={e.adminRemoved}
                  reason={e.adminRemovedReason}
                  busy={isPending}
                  onRemove={(reason) =>
                    startTransition(async () => {
                      await adminSetEntryRemoved(accessToken, e.id, true, reason);
                      load();
                    })
                  }
                  onRestore={() =>
                    startTransition(async () => {
                      await adminSetEntryRemoved(accessToken, e.id, false);
                      load();
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.rows.length === 0 && <p className="py-6 text-sm text-gray-400">No submitted entries yet.</p>}
    </div>
  );
}

const REASON_LABELS: Record<string, string> = {
  illegal: "Illegal content",
  sexual_explicit: "Sexual or explicit content",
  spam_scam: "Spam or scam",
  other: "Other",
};

function ReportsTab({ accessToken }: { accessToken: string }) {
  const [state, setState] = useState<LoadState<AdminReportRow>>({ status: "loading" });
  const [isPending, startTransition] = useTransition();

  function load() {
    adminListReports(accessToken)
      .then((rows) => setState({ status: "ready", rows }))
      .catch((e) => {
        const message = e instanceof Error ? e.message : String(e);
        setState(message === "Not authorized." ? { status: "unauthorized" } : { status: "error", message });
      });
  }

  useEffect(load, [accessToken]);

  function resolve(reportId: string, status: "resolved" | "dismissed") {
    startTransition(async () => {
      await adminResolveReport(accessToken, reportId, status);
      load();
    });
  }

  if (state.status === "loading") return <p className="text-sm text-gray-400">Loading…</p>;
  if (state.status === "unauthorized") return <p className="text-sm text-red-600">Not authorized.</p>;
  if (state.status === "error") return <p className="text-sm text-red-600">{state.message}</p>;

  if (state.rows.length === 0) {
    return <p className="py-6 text-sm text-gray-400">No open reports.</p>;
  }

  return (
    <div className="space-y-3">
      {state.rows.map((r) => (
        <div key={r.id} className="border border-gray-200 p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <span className="bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                {REASON_LABELS[r.reason] ?? r.reason}
              </span>
              <span className="ml-2 text-xs text-gray-400">{formatDate(r.createdAt)}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={isPending} onClick={() => resolve(r.id, "dismissed")}>
                Dismiss
              </Button>
              <Button variant="primary" size="sm" disabled={isPending} onClick={() => resolve(r.id, "resolved")}>
                Mark resolved
              </Button>
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-900">
            {r.competitionSlug ? (
              <Link href={`/competitions/${r.competitionSlug}`} target="_blank" className="font-medium hover:underline">
                {r.competitionTitle}
              </Link>
            ) : (
              <span className="font-medium">{r.entryTitle ?? "—"}</span>
            )}
          </p>

          {r.details && <p className="mt-1 text-sm text-gray-600">{r.details}</p>}
          {r.reporterEmail && (
            <p className="mt-1 text-xs text-gray-400">Reporter contact: {r.reporterEmail}</p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [tab, setTab] = useState<"reports" | "competitions" | "entries">("reports");
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated) return;
    getAccessToken().then(setAccessToken);
  }, [ready, authenticated, getAccessToken]);

  if (!ready) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <div className="mx-auto h-8 w-48 animate-pulse bg-gray-100" />
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
        <p className="mt-3 text-gray-500">Sign in with an admin account to continue.</p>
        <Button onClick={login} className="mt-6">Sign in</Button>
      </main>
    );
  }

  if (!accessToken) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <div className="mx-auto h-8 w-48 animate-pulse bg-gray-100" />
      </main>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
      <p className="mt-1 text-sm text-gray-500">
        Remove a competition or submission from public view. Removal only affects
        visibility on the Platform — any funds already locked in a competition&apos;s
        escrow still follow their normal release conditions.
      </p>

      <div className="mt-6 flex gap-1 border-b border-gray-200">
        {(["reports", "competitions", "entries"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "border-b-2 border-gray-900 text-gray-900" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "reports" && <ReportsTab accessToken={accessToken} />}
        {tab === "competitions" && <CompetitionsTab accessToken={accessToken} />}
        {tab === "entries" && <EntriesTab accessToken={accessToken} />}
      </div>
    </div>
  );
}
