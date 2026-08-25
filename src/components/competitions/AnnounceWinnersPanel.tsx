"use client";

import { useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { announceWinners } from "@/app/actions/organizer";
import type { OrganizerCompetition, DashboardEntry } from "@/app/actions/organizer";
import { formatCurrency } from "@/lib/utils";

export function AnnounceWinnersPanel({
  competition,
  entries,
  onAnnounced,
}: {
  competition: OrganizerCompetition;
  entries: DashboardEntry[];
  onAnnounced: () => void;
}) {
  const { getAccessToken } = usePrivy();
  const submitted = entries.filter((e) => e.status === "submitted");
  const tiers = competition.prizeBreakdown;

  const [picks, setPicks] = useState<Record<number, string>>(
    Object.fromEntries(tiers.map((_, i) => [i, ""]))
  );
  const [statements, setStatements] = useState<Record<number, string>>({});
  const [jurySummary, setJurySummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const anyPicked = Object.values(picks).some(Boolean);

  async function handleSubmit() {
    if (!anyPicked) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      const winnerPicks = tiers
        .map((_, i) => ({
          tierIndex: i,
          entryId: picks[i] ?? "",
          juryStatement: statements[i] ?? "",
        }))
        .filter((p) => p.entryId);
      await announceWinners(token, competition.id, winnerPicks, jurySummary);
      setDone(true);
      onAnnounced();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to announce winners.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted.length === 0) {
    return (
      <div className="px-6 py-8 text-center text-sm text-gray-400">
        No submitted entries yet — winners can be selected once entries come in.
      </div>
    );
  }

  if (done) {
    return (
      <div className="px-6 py-8 text-center">
        <div className="text-sm font-medium text-emerald-700">Winners announced.</div>
        <div className="mt-1 text-xs text-gray-400">The competition page is now updated.</div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50 px-6 py-5">
      <div className="space-y-6">
        {tiers.map((tier, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900">{tier.place}</span>
              {!competition.isOpenPool && tier.amount > 0 && (
                <span className="text-xs text-gray-400">{formatCurrency(tier.amount)}</span>
              )}
            </div>
            <select
              value={picks[i] ?? ""}
              onChange={(e) => setPicks((p) => ({ ...p, [i]: e.target.value }))}
              disabled={submitting}
              className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">— Select an entry —</option>
              {submitted.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.title} — {entry.submitter?.name ?? "Unknown"}
                </option>
              ))}
            </select>
            {picks[i] && (
              <textarea
                rows={2}
                value={statements[i] ?? ""}
                onChange={(e) => setStatements((s) => ({ ...s, [i]: e.target.value }))}
                placeholder="Jury statement (optional)…"
                disabled={submitting}
                className="mt-2 w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-500 placeholder:text-gray-300 focus:border-gray-400 focus:outline-none disabled:bg-gray-50 resize-none"
              />
            )}
          </div>
        ))}

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">
            Jury report <span className="text-red-500">*</span>
          </label>
          <p className="mb-1.5 text-[11px] text-gray-400">
            Required by the UIA Accord — explain how the jury deliberated and reached its decision. Minimum 50 characters.
          </p>
          <textarea
            rows={4}
            value={jurySummary}
            onChange={(e) => setJurySummary(e.target.value)}
            placeholder="The jury evaluated all submitted entries against the stated criteria. After deliberation, the jury selected…"
            disabled={submitting}
            className={`w-full border bg-white px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 resize-none ${
              jurySummary.trim().length > 0 && jurySummary.trim().length < 50
                ? "border-amber-300"
                : "border-gray-200"
            }`}
          />
          <div className="mt-1 flex justify-between">
            <span className={`text-[11px] ${jurySummary.trim().length < 50 ? "text-amber-600" : "text-gray-400"}`}>
              {jurySummary.trim().length}/50 minimum
            </span>
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            disabled={submitting || !anyPicked || jurySummary.trim().length < 50}
          >
            {submitting ? "Announcing…" : "Announce Results"}
          </Button>
          <p className="text-xs text-gray-400">
            This sets the competition to "announced" and publishes results publicly.
          </p>
        </div>
      </div>
    </div>
  );
}
