"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "Basics", description: "Title, type, and category" },
  { id: 2, title: "Brief", description: "Your competition brief" },
  { id: 3, title: "Jury & Criteria", description: "Who judges and how" },
  { id: 4, title: "Prize Pool", description: "Fund your competition" },
  { id: 5, title: "Timeline", description: "Deadlines and deliverables" },
  { id: 6, title: "Rights & IP", description: "Protect designers" },
  { id: 7, title: "Review", description: "Preview and publish" },
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
    description: "Organizer may display entries for competition exhibition purposes only.",
    recommended: true,
    warningLevel: "none" as const,
  },
  {
    value: "non_exclusive_license",
    label: "Non-exclusive license",
    description: "Organizer gets limited usage rights for a specific purpose. Designer keeps ownership.",
    recommended: false,
    warningLevel: "info" as const,
  },
  {
    value: "winning_license",
    label: "Winning entry license",
    description: "Only the winning design grants specific rights. All other submissions remain fully owned by designers.",
    recommended: false,
    warningLevel: "info" as const,
  },
  {
    value: "winning_transfer",
    label: "Full transfer (winning entry only)",
    description: "Ownership of winning design transfers to organizer. This should be reflected in the prize amount.",
    recommended: false,
    warningLevel: "caution" as const,
  },
];

function StepBasics() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Competition Title</label>
        <input
          type="text"
          placeholder="e.g., Reimagining Public Housing"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Competition Type</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {COMPETITION_TYPES.map((type) => (
            <label
              key={type.value}
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 hover:border-gray-300"
            >
              <input type="radio" name="type" className="mt-1 border-gray-300 text-gray-900 focus:ring-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900">{type.label}</div>
                <div className="text-xs text-gray-500">{type.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Short Description</label>
        <textarea
          rows={3}
          placeholder="One or two sentences summarizing your competition..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          placeholder="e.g., New York, NY or Global"
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
}

function StepBrief() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Tip:</strong> Great briefs are specific about the challenge but open about the solution.
          Include enough context for designers to understand the problem deeply, but don&apos;t prescribe the answer.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Full Brief</label>
        <textarea
          rows={10}
          placeholder="Describe the challenge, context, and what you're looking for..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Design Objectives</label>
        <p className="text-xs text-gray-500">List the key objectives designers should address</p>
        {[1, 2, 3].map((i) => (
          <input
            key={i}
            type="text"
            placeholder={`Objective ${i}`}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        ))}
        <button className="mt-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          + Add another objective
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Site Context</label>
        <textarea
          rows={3}
          placeholder="Describe the site, constraints, and physical context (or 'Conceptual' for ideas competitions)..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
}

function StepJury() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-700">
          <strong>Did you know?</strong> Competitions with 3+ jury members attract 2x more submissions.
          Named jury members with public bios build trust with potential submitters.
        </p>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Jury Members</h3>
        <div className="mt-3 rounded-lg border border-gray-200 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Name" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Title" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Organization" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Photo URL" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
          </div>
          <textarea
            rows={2}
            placeholder="Short bio..."
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
          />
        </div>
        <button className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900">
          + Add jury member
        </button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Evaluation Criteria</h3>
        <p className="text-xs text-gray-500">Define how submissions will be judged (weights must total 100%)</p>
        <div className="mt-3 space-y-3">
          {["Design Innovation", "Feasibility", "Sustainability"].map((name, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                defaultValue={name}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  defaultValue={i === 0 ? 40 : i === 1 ? 35 : 25}
                  className="w-16 rounded-lg border border-gray-300 px-2 py-2 text-center text-sm focus:border-gray-400 focus:outline-none"
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            </div>
          ))}
        </div>
        <button className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900">
          + Add criterion
        </button>
      </div>
    </div>
  );
}

function StepPrizePool() {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Total Prize Pool</label>
        <p className="text-xs text-gray-500">Minimum $100 — funds are escrowed before the competition goes live</p>
        <div className="relative mt-1">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
          <input
            type="number"
            placeholder="10,000"
            min={100}
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-4 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Prize Breakdown</h3>
        <div className="mt-3 space-y-2">
          {["1st Place", "2nd Place", "3rd Place"].map((place, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600">{place}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  placeholder={i === 0 ? "5,000" : i === 1 ? "3,000" : "2,000"}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>
          ))}
          <button className="text-sm font-medium text-gray-600 hover:text-gray-900">
            + Add honorable mentions
          </button>
        </div>
      </div>

      {/* Platform fee preview */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Fee Transparency Preview</h3>
        <div className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Prize pool</span>
            <span className="text-gray-900">$10,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Platform fee (5%)</span>
            <span className="text-gray-500">-$500</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 font-semibold">
            <span className="text-gray-900">Net to winners</span>
            <span className="text-gray-900">$9,500</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          The 5% fee is only taken at payout. If the competition is cancelled, all funds are returned.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-purple-200 bg-purple-50 p-4">
        <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-400" />
        <div>
          <div className="text-sm font-medium text-purple-900">Enable Open Prize Pool</div>
          <p className="text-xs text-purple-700">
            Allow anyone to contribute to this competition&apos;s prize fund, making it bigger and attracting more submissions.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepTimeline() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Registration Deadline</label>
          <input type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Submission Deadline</label>
          <input type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Judging Period Starts</label>
          <input type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Announcement Date</label>
          <input type="date" className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700">Deliverables</h3>
        <p className="text-xs text-gray-500">What should submitters provide?</p>
        <div className="mt-3 rounded-lg border border-gray-200 p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <input placeholder="Type (e.g., Presentation Board)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Format (e.g., PDF)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
            <input placeholder="Max size (e.g., 50MB)" className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none" />
          </div>
        </div>
        <button className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900">
          + Add deliverable
        </button>
      </div>
    </div>
  );
}

function StepRights() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-emerald-50 p-4">
        <p className="text-sm text-emerald-800">
          <strong>Our platform default:</strong> Designers retain all rights.
          We believe the people who create the ideas should own them. You can choose other options, but we encourage keeping the default.
        </p>
      </div>

      <div className="space-y-3">
        {IP_OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-gray-50",
              option.warningLevel === "none" && "border-emerald-200",
              option.warningLevel === "info" && "border-blue-200",
              option.warningLevel === "caution" && "border-amber-200",
            )}
          >
            <input
              type="radio"
              name="ip"
              defaultChecked={option.recommended}
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

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> This platform does not allow terms that claim rights over all submissions.
          You may negotiate rights for the winning entry only. IP terms are locked once the competition goes live
          and cannot be changed after designers have started working.
        </p>
      </div>
    </div>
  );
}

function StepReview() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-3 text-lg font-semibold text-emerald-900">Ready to Preview</h3>
        <p className="mt-1 text-sm text-emerald-700">
          Review your competition below. Once you fund the prize pool, your competition will go live.
        </p>
      </div>

      {/* Preview checklist */}
      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700">Publication Checklist</h3>
        <div className="mt-3 space-y-2">
          {[
            "Competition title and type",
            "Full brief with design objectives",
            "At least 1 jury member",
            "Evaluation criteria (weights total 100%)",
            "Prize pool funded ($100 minimum)",
            "Timeline with all key dates",
            "Deliverables specified",
            "IP terms selected",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                <svg className="h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-gray-600">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" disabled className="w-full sm:w-auto">
          Fund Prize Pool & Publish (Coming Soon)
        </Button>
        <p className="mt-2 text-xs text-gray-400">
          Prize funds are escrowed and only released to winners upon completion
        </p>
      </div>
    </div>
  );
}

const STEP_COMPONENTS = [StepBasics, StepBrief, StepJury, StepPrizePool, StepTimeline, StepRights, StepReview];

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const StepComponent = STEP_COMPONENTS[currentStep];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create a Competition</h1>
        <p className="mt-1 text-gray-500">
          Free to create. Fund your prize pool and let the ideas flow.
        </p>
      </div>

      {/* Stepper */}
      <nav className="mb-8 overflow-x-auto">
        <ol className="flex min-w-max gap-1">
          {STEPS.map((step, i) => (
            <li key={step.id} className="flex-1">
              <button
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "flex w-full flex-col rounded-lg border px-3 py-2 text-left transition-colors",
                  i === currentStep
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-xs font-medium opacity-70">Step {step.id}</span>
                <span className="text-sm font-semibold">{step.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      {/* Step content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">{STEPS[currentStep].title}</h2>
        <p className="mb-6 text-sm text-gray-500">{STEPS[currentStep].description}</p>
        <StepComponent />
      </div>

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
        >
          &larr; Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
          disabled={currentStep === STEPS.length - 1}
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
}
