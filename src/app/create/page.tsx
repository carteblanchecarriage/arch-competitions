"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createCompetition, type TierInput, type JuryInput } from "@/app/actions/competition";
import { saveDraft, getMyDraft, discardDraft } from "@/app/actions/draft";
import { searchSubmitters, type SubmitterSearchResult } from "@/app/actions/submitter";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { FileUpload } from "@/components/ui/FileUpload";
import type { CompetitionAttachment } from "@/data/types";

const PLATFORM_FEE = 5;

const STEPS = [
  { id: 1, title: "Basics", description: "Title, type, and location" },
  { id: 2, title: "Brief", description: "Your competition brief" },
  { id: 3, title: "Prize Pool", description: "Structure the prize" },
  { id: 4, title: "Timeline", description: "Registration and submission deadlines" },
  { id: 5, title: "Jury", description: "Add judges from Counterparti accounts" },
  { id: 6, title: "Rights & IP", description: "Protect designers" },
  { id: 7, title: "Review", description: "Preview and publish" },
];


const IP_OPTIONS = [
  {
    value: "retain_all",
    label: "Designers retain all rights",
    description: "Organizer may display entries for exhibition purposes only.",
    warningLevel: "none" as const,
    recommended: true,
  },
  {
    value: "non_exclusive_license",
    label: "Non-exclusive license",
    description: "Organizer gets limited usage rights. Designer keeps ownership.",
    warningLevel: "info" as const,
    recommended: false,
  },
  {
    value: "winning_license",
    label: "Winning entry license",
    description: "Only the winning design grants specific rights. All other entries remain fully owned by designers.",
    warningLevel: "info" as const,
    recommended: false,
  },
  {
    value: "winning_transfer",
    label: "Full transfer (winning entry only)",
    description: "Ownership of winning design transfers to organizer. Must be reflected in prize value.",
    warningLevel: "caution" as const,
    recommended: false,
  },
];

const DEFAULT_TIERS: TierInput[] = [
  { place: "1st Place", percent: 60 },
  { place: "2nd Place", percent: 30 },
  { place: "3rd Place", percent: 10 },
];

interface FormState {
  // Basics
  title: string;
  type: string;
  shortDescription: string;
  location: string;
  heroImageUrl: string;
  uploadSessionId: string;
  // Brief
  brief: string;
  designObjectives: string[];
  siteContext: string;
  attachments: CompetitionAttachment[];
  // Prize
  isOpenPool: boolean;
  totalAmount: string;
  tiers: TierInput[];
  // Timeline
  registrationDeadline: string;
  submissionDeadline: string;
  // Jury
  jury: JuryInput[];
  juryConflictDeclared: boolean;
  // Rights
  ipTermsType: string;
  professionalFeesAcknowledged: boolean;
}

function blankForm(): FormState {
  return {
    title: "",
    type: "open",
    shortDescription: "",
    location: "",
    heroImageUrl: "",
    uploadSessionId: crypto.randomUUID(),
    brief: "",
    designObjectives: ["", "", ""],
    siteContext: "",
    attachments: [],
    isOpenPool: false,
    totalAmount: "",
    tiers: DEFAULT_TIERS,
    registrationDeadline: "",
    submissionDeadline: "",
    jury: [],
    juryConflictDeclared: false,
    ipTermsType: "retain_all",
    professionalFeesAcknowledged: false,
  };
}

// ── Step components ────────────────────────────────────────────────────────

function StepBasics({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Competition Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="e.g., Reimagining Public Housing"
          className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Short Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          value={form.shortDescription}
          onChange={(e) => set({ shortDescription: e.target.value })}
          placeholder="One or two sentences summarizing your competition…"
          className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="e.g., New York, NY or Global"
          className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
        <p className="mt-0.5 text-xs text-gray-500">
          Shown as the hero image on your competition page. Landscape, at least 1200px wide.
        </p>
        <div className="mt-2">
          <ImageUpload
            value={form.heroImageUrl}
            onChange={(url) => set({ heroImageUrl: url })}
            uploadSessionId={form.uploadSessionId}
          />
        </div>
      </div>
    </div>
  );
}

function StepBrief({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  function setObjective(i: number, value: string) {
    const next = [...form.designObjectives];
    next[i] = value;
    set({ designObjectives: next });
  }

  function addObjective() {
    set({ designObjectives: [...form.designObjectives, ""] });
  }

  return (
    <div className="space-y-6">
      <div className=" bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Great briefs are specific about the challenge but open about the solution.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Brief</label>
        <textarea
          rows={10}
          value={form.brief}
          onChange={(e) => set({ brief: e.target.value })}
          placeholder="Describe the challenge, context, and what you're looking for…"
          className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Design Objectives</label>
        <p className="text-xs text-gray-500">Key objectives designers should address</p>
        {form.designObjectives.map((obj, i) => (
          <input
            key={i}
            type="text"
            value={obj}
            onChange={(e) => setObjective(i, e.target.value)}
            placeholder={`Objective ${i + 1}`}
            className="mt-2 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        ))}
        <button
          onClick={addObjective}
          className="mt-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          + Add objective
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Site Context</label>
        <textarea
          rows={3}
          value={form.siteContext}
          onChange={(e) => set({ siteContext: e.target.value })}
          placeholder="Describe the site and physical context (or leave blank for ideas competitions)…"
          className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Brief Attachments</label>
        <p className="mt-0.5 text-xs text-gray-500">
          PDF briefs, site drawings, CAD files, Rhino models, reference images — anything participants need.
        </p>
        <div className="mt-3">
          <FileUpload
            files={form.attachments}
            onAdd={(attachment) => set({ attachments: [...form.attachments, attachment] })}
            onRemove={(i) => set({ attachments: form.attachments.filter((_, idx) => idx !== i) })}
            uploadSessionId={form.uploadSessionId}
          />
        </div>
      </div>
    </div>
  );
}

function StepPrize({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const tierSum = form.tiers.reduce((s, t) => s + (Number(t.percent) || 0), 0);
  const tierValid = Math.abs(tierSum - 100) < 0.01;
  const netPercent = 100 - PLATFORM_FEE;

  function setTier(i: number, patch: Partial<TierInput>) {
    const next = form.tiers.map((t, idx) => (idx === i ? { ...t, ...patch } : t));
    set({ tiers: next });
  }

  function addTier() {
    set({ tiers: [...form.tiers, { place: `${form.tiers.length + 1}th Place`, percent: 0 }] });
  }

  function removeTier(i: number) {
    set({ tiers: form.tiers.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-6">
      {/* Open pool toggle */}
      <label className="flex cursor-pointer items-start gap-3  border border-purple-200 bg-purple-50 p-4">
        <input
          type="checkbox"
          checked={form.isOpenPool}
          onChange={(e) => set({ isOpenPool: e.target.checked })}
          className="mt-0.5  border-purple-300 text-purple-600 focus:ring-purple-400"
        />
        <div>
          <div className="text-sm font-medium text-purple-900">Enable Open Prize Pool</div>
          <p className="text-xs text-purple-700">
            Anyone can contribute to grow the prize fund. Prize splits stay fixed; amounts scale with the pool. Open pool competitions cannot be cancelled — contributors need that guarantee.
          </p>
        </div>
      </label>

      {/* Total amount — only shown for fixed pools */}
      {!form.isOpenPool && (
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total Prize Pool <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500">Funds are escrowed before the competition goes live</p>
          <div className="relative mt-1">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">$</span>
            <input
              type="number"
              value={form.totalAmount}
              onChange={(e) => set({ totalAmount: e.target.value })}
              placeholder="10,000"
              min={100}
              className="w-full  border border-gray-300 py-2.5 pl-8 pr-4 text-sm focus:border-gray-400 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Tier splits — always percentages of winner share */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Prize Splits</h3>
            <p className="text-xs text-gray-500">
              Percentages of the winner pool (after {PLATFORM_FEE}% platform fee) — must total 100%
            </p>
          </div>
          <span className={cn(
            "text-sm font-semibold tabular-nums",
            tierValid ? "text-emerald-600" : "text-red-500"
          )}>
            {tierSum.toFixed(tierSum % 1 === 0 ? 0 : 1)}%
            {tierValid ? " ✓" : ` / 100%`}
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {form.tiers.map((tier, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={tier.place}
                onChange={(e) => setTier(i, { place: e.target.value })}
                className="w-28  border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tier.percent}
                  onChange={(e) => setTier(i, { percent: Number(e.target.value) })}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full  border border-gray-200 py-2 pl-3 pr-7 text-sm focus:border-gray-400 focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">%</span>
              </div>
              {!form.isOpenPool && form.totalAmount && (
                <span className="w-24 text-right text-xs text-gray-400">
                  ~${Math.round(Number(form.totalAmount) * (1 - PLATFORM_FEE / 100) * (tier.percent / 100)).toLocaleString()}
                </span>
              )}
              {form.tiers.length > 1 && (
                <button
                  onClick={() => removeTier(i)}
                  className="text-gray-300 hover:text-red-400"
                  aria-label="Remove tier"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addTier}
          className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          + Add tier
        </button>
      </div>

      {/* Fee transparency */}
      {!form.isOpenPool && form.totalAmount && (
        <div className=" border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Prize pool</span>
            <span>${Number(form.totalAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Platform fee ({PLATFORM_FEE}%)</span>
            <span>-${Math.round(Number(form.totalAmount) * PLATFORM_FEE / 100).toLocaleString()}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <span>Net to winners</span>
            <span>${Math.round(Number(form.totalAmount) * netPercent / 100).toLocaleString()}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            5% platform fee applies to all distributions. If you cancel: 50% goes to registered designers (less 5%), 50% returned to you (less 5%).
          </p>
        </div>
      )}

      {!tierValid && (
        <div className=" bg-red-50 px-3 py-2 text-xs text-red-700">
          Prize splits must total exactly 100%. Currently at {tierSum.toFixed(1)}%.
        </div>
      )}
    </div>
  );
}

function StepTimeline({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const weeksUntilDeadline = form.submissionDeadline
    ? Math.floor((new Date(form.submissionDeadline).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000))
    : null;
  const tooSoon = weeksUntilDeadline !== null && weeksUntilDeadline < 8;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
          <input
            type="date"
            value={form.registrationDeadline}
            onChange={(e) => set({ registrationDeadline: e.target.value })}
            className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Submission Deadline <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.submissionDeadline}
            onChange={(e) => set({ submissionDeadline: e.target.value })}
            className="mt-1 w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {tooSoon && (
        <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Short preparation window:</strong> The UIA recommends a minimum of 8 weeks between publication and submission deadline for ideas competitions (12 weeks for project competitions). Your current deadline gives designers only {weeksUntilDeadline} {weeksUntilDeadline === 1 ? "week" : "weeks"}. A compressed timeline reduces participation quality and may deter experienced designers.
        </div>
      )}

      <p className="text-xs text-gray-400">
        Judging and announcement dates can be added after the competition goes live.
      </p>
    </div>
  );
}

function StepJury({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SubmitterSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await searchSubmitters(q));
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function addJuror(s: SubmitterSearchResult) {
    if (form.jury.some((j) => j.submitterSlug === s.slug)) return;
    const location = [s.city, s.country].filter(Boolean).join(", ");
    set({ jury: [...form.jury, { submitterSlug: s.slug, name: s.name, photo: s.photo, bio: s.bio, location, isChair: false, isArchitect: false }] });
    setQuery("");
    setResults([]);
  }

  function setJurorChair(slug: string) {
    set({ jury: form.jury.map((j) => ({ ...j, isChair: j.submitterSlug === slug })) });
  }

  function toggleJurorArchitect(slug: string) {
    set({ jury: form.jury.map((j) => j.submitterSlug === slug ? { ...j, isArchitect: !j.isArchitect } : j) });
  }

  function removeJuror(i: number) {
    set({ jury: form.jury.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="space-y-6">
      <div className=" bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          Jurors must have an account on Counterparti. Search by name to find and add them.
          You can also skip this step and add jurors after publishing.
        </p>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Search for jurors</label>
        <div className="relative mt-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setResults([]), 150)}
            placeholder="Name…"
            className="w-full  border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
          {searching && (
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <div className="h-4 w-4 animate-spin  border-2 border-gray-300 border-t-gray-600" />
            </div>
          )}
          {results.length > 0 && (
            <div className="absolute z-10 mt-1 w-full overflow-hidden  border border-gray-200 bg-white shadow-lg">
              {results.map((s) => {
                const already = form.jury.some((j) => j.submitterSlug === s.slug);
                return (
                  <button
                    key={s.slug}
                    onMouseDown={() => addJuror(s)}
                    disabled={already}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      already ? "cursor-default opacity-40" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="h-8 w-8 shrink-0 overflow-hidden  bg-gray-200">
                      {s.photo && <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{s.name}</div>
                      <div className="truncate text-xs text-gray-500">{[s.city, s.country].filter(Boolean).join(", ")}</div>
                    </div>
                    {already && <span className="text-xs text-gray-400">Added</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Juror list */}
      {form.jury.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-sm font-medium text-gray-700">Jury ({form.jury.length})</div>
            {form.jury.length > 0 && (() => {
              const architects = form.jury.filter((j) => j.isArchitect).length;
              const required = Math.floor(form.jury.length / 2) + 1;
              return architects < required ? (
                <span className="text-xs text-amber-600">{architects}/{form.jury.length} architects — need {required} for UIA majority</span>
              ) : (
                <span className="text-xs text-emerald-600">✓ {architects}/{form.jury.length} architects (UIA majority met)</span>
              );
            })()}
          </div>
          {form.jury.map((j, i) => (
            <div key={j.submitterSlug} className="border border-gray-200 p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 overflow-hidden bg-gray-100">
                  {j.photo
                    ? <img src={j.photo} alt={j.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-400">{j.name.charAt(0)}</div>
                  }
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{j.name}</span>
                    {j.isChair && <span className="bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium text-white">Chair</span>}
                  </div>
                  {j.location && <div className="text-xs text-gray-500">{j.location}</div>}
                </div>
                <button onClick={() => removeJuror(i)} className="text-gray-300 hover:text-red-400" aria-label="Remove">
                  ×
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-4 pl-13">
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={!!j.isArchitect}
                    onChange={() => toggleJurorArchitect(j.submitterSlug)}
                    className="border-gray-300"
                  />
                  Licensed architect
                </label>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-gray-600">
                  <input
                    type="radio"
                    name="jury-chair"
                    checked={!!j.isChair}
                    onChange={() => setJurorChair(j.submitterSlug)}
                    className="border-gray-300"
                  />
                  Jury chair
                </label>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400">No jurors added yet.</p>
      )}

      {/* Conflict-of-interest declaration */}
      {form.jury.length > 0 && (
        <label className="flex cursor-pointer items-start gap-3 border border-gray-200 bg-gray-50 p-4">
          <input
            type="checkbox"
            checked={form.juryConflictDeclared}
            onChange={(e) => set({ juryConflictDeclared: e.target.checked })}
            className="mt-0.5 border-gray-300"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">Conflict-of-interest declaration</div>
            <p className="mt-0.5 text-xs text-gray-500">
              I confirm that all listed jurors are independent — they have no personal, professional, or financial relationship with the organizer or any likely competitor that could compromise impartiality. This is required by the UIA Accord on Competitions.
            </p>
          </div>
        </label>
      )}
    </div>
  );
}

function StepRights({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div className=" bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">
          <strong>Our default:</strong> Designers retain all rights.
          We believe creators should own their ideas.
        </p>
      </div>

      <div className="border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm font-medium text-blue-900">UIA requirement: Professional fees</p>
        <p className="mt-1 text-xs text-blue-700">
          If the winning design is selected for commission and construction, the winner must receive standard professional fees in addition to the prize. The prize is recognition for the competition — it is not payment for professional services. This is mandatory under the UIA Accord on Competitions.
        </p>
      </div>

      <div className="space-y-3">
        {IP_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3  border p-4 transition-colors",
              form.ipTermsType === option.value ? "border-gray-900 bg-gray-50" : "hover:bg-gray-50",
              option.warningLevel === "none" && form.ipTermsType !== option.value && "border-emerald-200",
              option.warningLevel === "info" && form.ipTermsType !== option.value && "border-blue-200",
              option.warningLevel === "caution" && form.ipTermsType !== option.value && "border-amber-200",
            )}
          >
            <input
              type="radio"
              name="ip"
              checked={form.ipTermsType === option.value}
              onChange={() => set({ ipTermsType: option.value })}
              className="mt-0.5 border-gray-300 text-gray-900 focus:ring-gray-400"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">{option.label}</span>
                {option.recommended && (
                  <span className=" bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    Recommended
                  </span>
                )}
                {option.warningLevel === "caution" && (
                  <span className=" bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    Designers will see a warning
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
      <label className="flex cursor-pointer items-start gap-3 border border-gray-900 bg-gray-50 p-4">
        <input
          type="checkbox"
          checked={form.professionalFeesAcknowledged}
          onChange={(e) => set({ professionalFeesAcknowledged: e.target.checked })}
          className="mt-0.5 border-gray-300"
        />
        <div>
          <div className="text-sm font-medium text-gray-900">I acknowledge the professional fees obligation</div>
          <p className="mt-0.5 text-xs text-gray-500">
            If I commission the winning design for construction, I will pay the winning architect full professional fees at standard rates, separate from and in addition to the competition prize.
          </p>
        </div>
      </label>
    </div>
  );
}

function StepReview({
  form,
  onSubmit,
  isPending,
  error,
}: {
  form: FormState;
  onSubmit: () => void;
  isPending: boolean;
  error: string | null;
}) {
  const tierSum = form.tiers.reduce((s, t) => s + (Number(t.percent) || 0), 0);
  const tierValid = Math.abs(tierSum - 100) < 0.01;

  const architectCount = form.jury.filter((j) => j.isArchitect).length;
  const architectMajority = form.jury.length === 0 || architectCount >= Math.floor(form.jury.length / 2) + 1;
  const chairDesignated = form.jury.length === 0 || form.jury.some((j) => j.isChair);

  const checks = [
    { label: "Competition title", ok: !!form.title },
    { label: "Short description", ok: !!form.shortDescription },
    { label: "Submission deadline", ok: !!form.submissionDeadline },
    { label: "Prize splits total 100%", ok: tierValid },
    { label: "Fixed pool amount set", ok: form.isOpenPool || !!form.totalAmount },
    { label: "IP terms selected", ok: !!form.ipTermsType },
    { label: "Professional fees obligation acknowledged (UIA)", ok: form.professionalFeesAcknowledged },
    ...(form.jury.length > 0 ? [
      { label: "Jury chair designated (UIA)", ok: chairDesignated },
      { label: `Architect majority on jury — ${architectCount}/${form.jury.length} (UIA)`, ok: architectMajority },
      { label: "Jury conflict-of-interest declared (UIA)", ok: form.juryConflictDeclared },
    ] : []),
  ];

  const allGood = checks.every((c) => c.ok);

  return (
    <div className="space-y-6">
      <div className=" border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Checklist</h3>
        <div className="mt-3 space-y-2">
          {checks.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center ",
                item.ok ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
              )}>
                {item.ok ? (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={item.ok ? "text-gray-700" : "text-red-600"}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className=" bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="text-center">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!allGood || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? "Creating competition…" : "Create Competition"}
        </Button>
        <p className="mt-2 text-xs text-gray-400">
          {form.isOpenPool
            ? "This creates a draft and deploys the escrow. It stays hidden from designers until at least one contribution lands and you publish it from your dashboard."
            : "This creates a draft and deploys the escrow. It stays hidden from designers until you fund the prize pool and publish it from your dashboard."}
        </p>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [step, setStep] = useState(0);
  const [form, setFormRaw] = useState<FormState>(blankForm());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hasDraft, setHasDraft] = useState(false);

  // Load existing draft on auth
  useEffect(() => {
    if (!ready || !authenticated) return;
    getAccessToken().then(async (token) => {
      if (!token) return;
      const draft = await getMyDraft(token).catch(() => null);
      if (draft) {
        setFormRaw((f) => ({ ...f, ...draft.data }));
        setHasDraft(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  function set(patch: Partial<FormState>) {
    setFormRaw((f) => ({ ...f, ...patch }));
  }

  function handleSaveDraft() {
    setDraftStatus("saving");
    startTransition(async () => {
      try {
        const token = await getAccessToken();
        if (!token) { login(); return; }
        await saveDraft(token, form);
        setHasDraft(true);
        setDraftStatus("saved");
        setTimeout(() => setDraftStatus("idle"), 2500);
      } catch {
        setDraftStatus("error");
        setTimeout(() => setDraftStatus("idle"), 3000);
      }
    });
  }

  function handleSubmit() {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          login();
          return;
        }
        const { slug } = await createCompetition(token, {
          title: form.title,
          type: form.type,
          shortDescription: form.shortDescription,
          location: form.location,
          heroImageUrl: form.heroImageUrl,
          brief: form.brief,
          designObjectives: form.designObjectives,
          siteContext: form.siteContext,
          registrationDeadline: form.registrationDeadline,
          submissionDeadline: form.submissionDeadline,
          isOpenPool: form.isOpenPool,
          totalAmount: Number(form.totalAmount) || 0,
          tiers: form.tiers,
          ipTermsType: form.ipTermsType,
          attachments: form.attachments,
          jury: form.jury,
          professionalFeesAcknowledged: form.professionalFeesAcknowledged,
        });
        // Clear draft on successful publish
        await discardDraft(token).catch(() => {});
        router.push(`/competitions/${slug}`);
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : String(e));
      }
    });
  }

  // ── Auth gate — block form until Privy is ready and user is signed in ───
  if (!ready) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <div className="mx-auto h-8 w-48 animate-pulse  bg-gray-100" />
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900">Create a Competition</h1>
        <p className="mt-3 text-gray-500">Sign in to publish a competition.</p>
        <Button onClick={login} className="mt-6">Sign in</Button>
      </main>
    );
  }

  const stepProps = { form, set };
  const stepComponents = [
    <StepBasics key="basics" {...stepProps} />,
    <StepBrief key="brief" {...stepProps} />,
    <StepPrize key="prize" {...stepProps} />,
    <StepTimeline key="timeline" {...stepProps} />,
    <StepJury key="jury" {...stepProps} />,
    <StepRights key="rights" {...stepProps} />,
    <StepReview key="review" form={form} onSubmit={handleSubmit} isPending={isPending} error={submitError} />,
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a Competition</h1>
        <p className="mt-1 text-gray-500">Free to create. Fund your prize pool and let the ideas flow.</p>
      </div>

      {/* Stepper */}
      <nav className="mb-8 overflow-x-auto">
        <ol className="flex min-w-max gap-1">
          {STEPS.map((s, i) => (
            <li key={s.id} className="flex-1">
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex w-full flex-col  border px-3 py-2 text-left transition-colors",
                  i === step
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-xs font-medium opacity-70">Step {s.id}</span>
                <span className="text-sm font-semibold">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className=" border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{STEPS[step].title}</h2>
        <p className="mb-6 text-sm text-gray-500">{STEPS[step].description}</p>
        {stepComponents[step]}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {/* Save draft — available from step 1 once there's a title */}
          {form.title.trim() && (
            <button
              onClick={handleSaveDraft}
              disabled={isPending || draftStatus === "saving"}
              className={`text-xs disabled:opacity-40 transition-colors ${draftStatus === "error" ? "text-red-500" : "text-gray-400 hover:text-gray-700"}`}
            >
              {draftStatus === "saving" ? "Saving…" : draftStatus === "saved" ? "✓ Draft saved" : draftStatus === "error" ? "Save failed — try again" : "Save draft"}
            </button>
          )}

          {step < STEPS.length - 1 && (
            <Button onClick={() => setStep(step + 1)}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
