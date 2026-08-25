"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { updateJury } from "@/app/actions/organizer";
import { searchSubmitters, type SubmitterSearchResult } from "@/app/actions/submitter";
import type { JuryMember } from "@/data/types";
import { cn } from "@/lib/utils";

export function OrganizerJuryPanel({
  competitionId,
  initialJury,
}: {
  competitionId: string;
  initialJury: JuryMember[];
}) {
  const { getAccessToken } = usePrivy();
  const [jury, setJury] = useState<JuryMember[]>(initialJury);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubmitterSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try { setResults(await searchSubmitters(q)); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function addJuror(s: SubmitterSearchResult) {
    if (jury.some((j) => j.submitterSlug === s.slug)) return;
    setJury((prev) => [...prev, {
      name: s.name,
      bio: s.bio ?? "",
      photo: s.photo ?? undefined,
      submitterSlug: s.slug,
      organization: [s.city, s.country].filter(Boolean).join(", "),
      isChair: false,
      isArchitect: false,
    }]);
    setQuery("");
    setResults([]);
    setSaved(false);
  }

  function removeJuror(slug: string) {
    setJury((prev) => prev.filter((j) => j.submitterSlug !== slug));
    setSaved(false);
  }

  function setChair(slug: string) {
    setJury((prev) => prev.map((j) => ({ ...j, isChair: j.submitterSlug === slug })));
    setSaved(false);
  }

  function toggleArchitect(slug: string) {
    setJury((prev) => prev.map((j) => j.submitterSlug === slug ? { ...j, isArchitect: !j.isArchitect } : j));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      await updateJury(token, competitionId, jury);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save jury.");
    } finally {
      setSaving(false);
    }
  }

  const architectCount = jury.filter((j) => j.isArchitect).length;
  const required = jury.length > 0 ? Math.floor(jury.length / 2) + 1 : 0;
  const majorityMet = jury.length === 0 || architectCount >= required;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Add juror by name</label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setResults([]), 150)}
            placeholder="Search by name…"
            className="w-full border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
          {searching && (
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <div className="h-3.5 w-3.5 animate-spin border-2 border-gray-300 border-t-gray-600" />
            </div>
          )}
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden border border-gray-200 bg-white shadow-lg">
              {results.map((s) => {
                const already = jury.some((j) => j.submitterSlug === s.slug);
                return (
                  <button
                    key={s.slug}
                    onMouseDown={() => addJuror(s)}
                    disabled={already}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                      already ? "cursor-default opacity-40" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="h-7 w-7 shrink-0 overflow-hidden bg-gray-200">
                      {s.photo && <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="truncate text-xs text-gray-400">{[s.city, s.country].filter(Boolean).join(", ")}</div>
                    </div>
                    {already && <span className="text-xs text-gray-400">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Jury list */}
      {jury.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-gray-600">Jury ({jury.length})</span>
            {jury.length > 0 && (
              <span className={cn("text-xs", majorityMet ? "text-emerald-600" : "text-amber-600")}>
                {majorityMet ? `✓ ${architectCount}/${jury.length} architects` : `${architectCount}/${jury.length} architects — need ${required}`}
              </span>
            )}
          </div>
          {jury.map((j) => (
            <div key={j.submitterSlug} className="border border-gray-100 p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden bg-gray-200">
                  {j.photo
                    ? <img src={j.photo} alt={j.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-gray-400">{j.name.charAt(0)}</div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{j.name}</span>
                    {j.isChair && <span className="bg-gray-900 px-1 py-0.5 text-[9px] font-medium text-white">Chair</span>}
                  </div>
                  {j.organization && <div className="text-xs text-gray-400">{j.organization}</div>}
                </div>
                <button onClick={() => removeJuror(j.submitterSlug!)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
              </div>
              <div className="mt-2 flex gap-4 pl-11">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                  <input type="checkbox" checked={!!j.isArchitect} onChange={() => toggleArchitect(j.submitterSlug!)} className="border-gray-300" />
                  Licensed architect
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                  <input type="radio" name={`chair-${competitionId}`} checked={!!j.isChair} onChange={() => setChair(j.submitterSlug!)} className="border-gray-300" />
                  Jury chair
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xs text-gray-400 py-2">No jurors added yet. Jurors must have a Counterparti account.</p>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save jury"}
        </Button>
        {saved && <span className="text-xs text-emerald-600">✓ Saved</span>}
      </div>
    </div>
  );
}
