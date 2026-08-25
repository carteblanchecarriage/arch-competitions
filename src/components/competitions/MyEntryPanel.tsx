"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getMyEntry, setEntryVisibility, withdrawEntry } from "@/app/actions/entry";
import type { WinnerEntry } from "@/data/types";

export function MyEntryPanel({
  competitionId,
  competitionStatus,
  winners,
}: {
  competitionId: string;
  competitionStatus: string;
  winners: WinnerEntry[];
}) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [entry, setEntry] = useState<{
    id: string;
    title: string;
    hidden_by_submitter: boolean;
    submitterSlug?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) { setLoading(false); return; }
    getAccessToken().then(async (token) => {
      if (!token) { setLoading(false); return; }
      try {
        const e = await getMyEntry(token, competitionId);
        if (e?.status === "submitted") {
          setEntry({
            id: e.id,
            title: e.title,
            hidden_by_submitter: e.hidden_by_submitter,
            submitterSlug: e.submitterSlug,
          });
        }
      } finally {
        setLoading(false);
      }
    });
  }, [ready, authenticated, competitionId]);

  if (!ready || loading || !entry || withdrawn) return null;

  const isWinner = winners.some((w) => w.submitterSlug && w.submitterSlug === entry.submitterSlug);
  if (isWinner) return null;

  async function handleToggleVisibility() {
    if (!entry) return;
    setActing(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      const next = !entry.hidden_by_submitter;
      await setEntryVisibility(token, entry.id, next);
      setEntry((e) => e ? { ...e, hidden_by_submitter: next } : e);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setActing(false);
    }
  }

  async function handleWithdraw() {
    if (!entry) return;
    setActing(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      await withdrawEntry(token, entry.id);
      setWithdrawn(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setConfirmWithdraw(false);
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="border border-gray-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        My submission
      </div>
      <p className="text-sm text-gray-700 truncate">{entry.title}</p>

      {competitionStatus === "open" ? (
        <div className="mt-3">
          {confirmWithdraw ? (
            <div className="space-y-2">
              <p className="text-xs text-red-700">Withdraw your entry? This cannot be undone — your entry will be removed from judging.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleWithdraw}
                  disabled={acting}
                  className="text-xs font-medium text-red-600 underline decoration-red-300 hover:decoration-red-600 disabled:opacity-40"
                >
                  {acting ? "Withdrawing…" : "Yes, withdraw"}
                </button>
                <button
                  onClick={() => setConfirmWithdraw(false)}
                  disabled={acting}
                  className="text-xs text-gray-400 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmWithdraw(true)}
              className="text-xs font-medium text-gray-500 underline decoration-gray-300 hover:text-red-600 hover:decoration-red-300"
            >
              Withdraw entry
            </button>
          )}
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {entry.hidden_by_submitter ? "Hidden from public gallery" : "Visible in public gallery"}
          </span>
          <button
            onClick={handleToggleVisibility}
            disabled={acting}
            className="text-xs font-medium text-gray-600 underline decoration-gray-300 hover:text-gray-900 disabled:opacity-40"
          >
            {acting ? "Saving…" : entry.hidden_by_submitter ? "Make visible" : "Hide"}
          </button>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
