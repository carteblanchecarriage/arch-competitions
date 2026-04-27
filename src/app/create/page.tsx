"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { createCompetition, type TierInput } from "@/app/actions/competition";
import type { CompetitionAttachment } from "@/data/types";

const PLATFORM_FEE = 5;

const STEPS = [
  { id: 1, title: "Basics", description: "Title, type, and location" },
  { id: 2, title: "Brief", description: "Your competition brief" },
  { id: 3, title: "Prize Pool", description: "Structure the prize" },
  { id: 4, title: "Timeline", description: "Registration and submission deadlines" },
  { id: 5, title: "Rights & IP", description: "Protect designers" },
  { id: 6, title: "Review", description: "Preview and publish" },
];

const COMPETITION_TYPES = [
  { value: "open", label: "Open", description: "Anyone can enter" },
  { value: "student", label: "Student", description: "Students and recent graduates" },
  { value: "ideas", label: "Ideas", description: "Conceptual — not tied to a specific site" },
  { value: "invite_only", label: "Invite Only", description: "Selected firms only" },
  { value: "awards", label: "Awards", description: "Portfolio-based recognition" },
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
  // Rights
  ipTermsType: string;
}

function blankForm(): FormState {
  return {
    title: "",
    type: "open",
    shortDescription: "",
    location: "",
    heroImageUrl: "",
    brief: "",
    designObjectives: ["", "", ""],
    siteContext: "",
    attachments: [],
    isOpenPool: false,
    totalAmount: "",
    tiers: DEFAULT_TIERS,
    registrationDeadline: "",
    submissionDeadline: "",
    ipTermsType: "retain_all",
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Competition Type</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {COMPETITION_TYPES.map((t) => (
            <label
              key={t.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                form.type === t.value ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
              )}
            >
              <input
                type="radio"
                name="type"
                checked={form.type === t.value}
                onChange={() => set({ type: t.value })}
                className="mt-1 border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{t.label}</div>
                <div className="text-xs text-gray-500">{t.description}</div>
              </div>
            </label>
          ))}
        </div>
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={form.location}
          onChange={(e) => set({ location: e.target.value })}
          placeholder="e.g., New York, NY or Global"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Cover Photo</label>
        <p className="text-xs text-gray-500">
          Shown as the hero image on your competition page. Landscape, at least 1200px wide.
        </p>
        {form.heroImageUrl && (
          <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <img
              src={form.heroImageUrl}
              alt="Cover preview"
              className="h-40 w-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </div>
        )}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="url"
            value={form.heroImageUrl}
            onChange={(e) => set({ heroImageUrl: e.target.value })}
            placeholder="https://example.com/image.jpg"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">Direct image upload coming soon — paste a URL for now.</p>
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
      <div className="rounded-lg bg-blue-50 p-4">
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
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
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Brief Attachments</label>
        <p className="text-xs text-gray-500">
          PDF briefs, site drawings, CAD files, Rhino models, reference images — anything participants need.
        </p>
        <div className="mt-3 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="mt-2 text-sm font-medium text-gray-500">File upload coming soon</p>
          <p className="text-xs text-gray-400">Supports PDF, DWG, DXF, 3DM, SKP, images, and more</p>
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
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <input
          type="checkbox"
          checked={form.isOpenPool}
          onChange={(e) => set({ isOpenPool: e.target.checked })}
          className="mt-0.5 rounded border-purple-300 text-purple-600 focus:ring-purple-400"
        />
        <div>
          <div className="text-sm font-medium text-purple-900">Enable Open Prize Pool</div>
          <p className="text-xs text-purple-700">
            Anyone can contribute to grow the prize fund. Prize splits stay fixed; amounts scale with the pool.
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
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-4 text-sm focus:border-gray-400 focus:outline-none"
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
                className="w-28 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
              <div className="relative flex-1">
                <input
                  type="number"
                  value={tier.percent}
                  onChange={(e) => setTier(i, { percent: Number(e.target.value) })}
                  min={0}
                  max={100}
                  step={0.5}
                  className="w-full rounded-lg border border-gray-200 py-2 pl-3 pr-7 text-sm focus:border-gray-400 focus:outline-none"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-gray-400">%</span>
              </div>
              {!form.isOpenPool && form.totalAmount && (
                <span className="w-24 text-right text-xs text-gray-400">
                  ≈ ${Math.round(Number(form.totalAmount) * (1 - PLATFORM_FEE / 100) * (tier.percent / 100)).toLocaleString()}
                </span>
              )}
              {form.tiers.length > 1 && (
                <button
                  onClick={() => removeTier(i)}
                  className="text-gray-300 hover:text-red-400"
                  aria-label="Remove tier"
                >
                  ✕
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
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Prize pool</span>
            <span>${Number(form.totalAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Platform fee ({PLATFORM_FEE}%)</span>
            <span>−${Math.round(Number(form.totalAmount) * PLATFORM_FEE / 100).toLocaleString()}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <span>Net to winners</span>
            <span>${Math.round(Number(form.totalAmount) * netPercent / 100).toLocaleString()}</span>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Fee is taken at payout only. If cancelled, all funds are returned in full.
          </p>
        </div>
      )}

      {!tierValid && (
        <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          Prize splits must total exactly 100%. Currently at {tierSum.toFixed(1)}%.
        </div>
      )}
    </div>
  );
}

function StepTimeline({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
          <input
            type="date"
            value={form.registrationDeadline}
            onChange={(e) => set({ registrationDeadline: e.target.value })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
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
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Judging and announcement dates can be added after the competition goes live.
      </p>
    </div>
  );
}

function StepRights({ form, set }: { form: FormState; set: (patch: Partial<FormState>) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">
          <strong>Our default:</strong> Designers retain all rights.
          We believe creators should own their ideas.
        </p>
      </div>

      <div className="space-y-3">
        {IP_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
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
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                    Recommended
                  </span>
                )}
                {option.warningLevel === "caution" && (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    Designers will see a warning
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{option.description}</p>
            </div>
          </label>
        ))}
      </div>
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

  const checks = [
    { label: "Competition title", ok: !!form.title },
    { label: "Short description", ok: !!form.shortDescription },
    { label: "Submission deadline", ok: !!form.submissionDeadline },
    { label: "Prize splits total 100%", ok: tierValid },
    { label: "Fixed pool amount set", ok: form.isOpenPool || !!form.totalAmount },
    { label: "IP terms selected", ok: !!form.ipTermsType },
  ];

  const allGood = checks.every((c) => c.ok);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Checklist</h3>
        <div className="mt-3 space-y-2">
          {checks.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
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
        <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      )}

      <div className="text-center">
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!allGood || isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? "Creating competition…" : form.isOpenPool ? "Publish (Open Pool)" : "Publish Competition"}
        </Button>
        <p className="mt-2 text-xs text-gray-400">
          {form.isOpenPool
            ? "An escrow is deployed and your competition goes live immediately."
            : "Your competition goes live. You'll fund the prize pool from your wallet next."}
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

  function set(patch: Partial<FormState>) {
    setFormRaw((f) => ({ ...f, ...patch }));
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
        });
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
        <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
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
                  "flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors",
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
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{STEPS[step].title}</h2>
        <p className="mb-6 text-sm text-gray-500">{STEPS[step].description}</p>
        {stepComponents[step]}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          ← Previous
        </Button>
        {step < STEPS.length - 1 && (
          <Button onClick={() => setStep(step + 1)}>
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}
