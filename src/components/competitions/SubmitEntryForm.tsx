"use client";

import { useState, useEffect, useId } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { getProfile } from "@/app/actions/profile";
import { getMyEntry, saveEntry } from "@/app/actions/entry";
import type { Competition, CompetitionAttachment } from "@/data/types";

type PageState =
  | { kind: "loading" }
  | { kind: "unauthenticated" }
  | { kind: "no_profile" }
  | { kind: "ready" }
  | { kind: "saving" }
  | { kind: "done" };

interface FormData {
  title: string;
  description: string;
  projectUrl: string;
  files: CompetitionAttachment[];
}

function blankForm(): FormData {
  return { title: "", description: "", projectUrl: "", files: [] };
}

export function SubmitEntryForm({ competition }: { competition: Competition }) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const rawId = useId();
  // useId returns ":r0:" style — strip colons for use in storage paths
  const sessionId = rawId.replace(/:/g, "");

  const [pageState, setPageState] = useState<PageState>({ kind: "loading" });
  const [form, setForm] = useState<FormData>(blankForm());
  const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ipAgreed, setIpAgreed] = useState(false);
  const [anonymityAgreed, setAnonymityAgreed] = useState(false);

  const needsIpAck = competition.ipTerms.warningLevel !== "none";

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { setPageState({ kind: "unauthenticated" }); return; }

    (async () => {
      const token = await getAccessToken();
      if (!token) { setPageState({ kind: "unauthenticated" }); return; }

      const profile = await getProfile(token).catch(() => null);
      if (!profile) { setPageState({ kind: "no_profile" }); return; }

      const entry = await getMyEntry(token, competition.id).catch(() => null);
      if (entry) {
        setForm({
          title: entry.title,
          description: entry.description,
          projectUrl: entry.project_url ?? "",
          files: entry.files,
        });
        setIsAlreadySubmitted(entry.status === "submitted");
      }

      setPageState({ kind: "ready" });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  async function handleSave(submit: boolean) {
    setError(null);
    if (!form.title.trim()) { setError("Please add a project title."); return; }
    if (submit && !anonymityAgreed) {
      setError("Please confirm your submission contains no identifying information.");
      return;
    }
    if (submit && needsIpAck && !ipAgreed) {
      setError("Please acknowledge the IP terms before submitting.");
      return;
    }

    setPageState({ kind: "saving" });
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Session expired — please sign in again.");

      await saveEntry(
        token,
        competition.id,
        {
          title: form.title,
          description: form.description,
          projectUrl: form.projectUrl || undefined,
          files: form.files,
        },
        submit
      );

      if (submit) {
        setIsAlreadySubmitted(true);
        setPageState({ kind: "done" });
      } else {
        setPageState({ kind: "ready" });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPageState({ kind: "ready" });
    }
  }

  // ── render states ────────────ï¿½ï¿½ï¿½──────────────────────ï¿½ï¿½──────────────────────

  if (pageState.kind === "loading") {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse  bg-gray-100" />
        ))}
      </div>
    );
  }

  if (pageState.kind === "unauthenticated") {
    return (
      <div className=" border border-gray-200 bg-white p-10 text-center">
        <p className="text-gray-600">Sign in to submit your entry.</p>
        <Button onClick={login} className="mt-4">Sign in</Button>
      </div>
    );
  }

  if (pageState.kind === "no_profile") {
    return (
      <div className=" border border-gray-200 bg-white p-10 text-center">
        <p className="font-medium text-gray-800">You need a profile first</p>
        <p className="mt-2 text-sm text-gray-500">
          Create a designer profile so your entry is attributed correctly.
        </p>
        <Link href="/account?edit=true">
          <Button className="mt-5">Create profile</Button>
        </Link>
      </div>
    );
  }

  if (pageState.kind === "done") {
    return (
      <div className=" border border-emerald-200 bg-emerald-50 p-10 text-center">
        <svg className="mx-auto h-10 w-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="mt-4 text-lg font-semibold text-gray-900">Entry submitted</h2>
        <p className="mt-2 text-sm text-gray-600">
          You can update your entry any time before the deadline.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={() => setPageState({ kind: "ready" })}>
            Edit entry
          </Button>
          <Link href={`/competitions/${competition.slug}`}>
            <Button variant="outline">Back to competition</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isBusy = pageState.kind === "saving";

  return (
    <div className="space-y-6">
      {/* Submitted banner */}
      {isAlreadySubmitted && (
        <div className=" border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ✓ Your entry is submitted. You can still update it until the deadline.
        </div>
      )}

      {/* Deliverables guide */}
      {competition.deliverables.length > 0 && (
        <div className=" border border-gray-200 bg-gray-50 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Required deliverables
          </h3>
          <ul className="mt-3 space-y-2.5">
            {competition.deliverables.map((d, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium text-gray-800">{d.type}</span>
                {d.format && <span className="text-gray-500"> Â· {d.format}</span>}
                {d.maxSize && <span className="text-gray-400 text-xs"> Â· max {d.maxSize}</span>}
                {d.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{d.description}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Form */}
      <div className=" border border-gray-200 bg-white p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Name your project"
            disabled={isBusy}
            className="mt-1.5 w-full  border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Describe your design approach, concept, and key decisions…"
            rows={5}
            disabled={isBusy}
            className="mt-1.5 w-full resize-none  border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Project URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Project link{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="url"
            value={form.projectUrl}
            onChange={(e) => setForm((f) => ({ ...f, projectUrl: e.target.value }))}
            placeholder="https://"
            disabled={isBusy}
            className="mt-1.5 w-full  border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
        </div>

        {/* Files */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Files</label>
          <div className="mt-1.5">
            <FileUpload
              bucket="entry-files"
              files={form.files}
              onAdd={(f) => setForm((prev) => ({ ...prev, files: [...prev.files, f] }))}
              onRemove={(i) =>
                setForm((prev) => ({ ...prev, files: prev.files.filter((_, idx) => idx !== i) }))
              }
              uploadSessionId={sessionId}
            />
          </div>
        </div>
      </div>

      {/* Anonymity acknowledgment — required on every submission */}
      <div className="border border-gray-200 bg-gray-50 p-5">
        <h3 className="text-sm font-semibold text-gray-800">Anonymous submission required</h3>
        <p className="mt-1 text-xs text-gray-500">
          This competition uses blind judging. Your submitted files, drawings, and written materials must contain <strong>no identifying information</strong>. The following are not permitted anywhere in your submission:
        </p>
        <ul className="mt-2 space-y-1 text-xs text-gray-500 list-disc list-inside">
          <li>Your name, firm name, or team members' names</li>
          <li>Logos, letterheads, or branded templates</li>
          <li>Email addresses, phone numbers, or website URLs</li>
          <li>Watermarks, signatures, or initials</li>
          <li>File metadata containing author or company fields</li>
        </ul>
        <label className="mt-3 flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={anonymityAgreed}
            onChange={(e) => setAnonymityAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 border-gray-300 accent-gray-800"
          />
          <span className="text-sm text-gray-700">
            I confirm my submission contains no identifying information
          </span>
        </label>
      </div>

      {/* IP terms acknowledgment */}
      {needsIpAck && (
        <div
          className={` border p-5 ${
            competition.ipTerms.warningLevel === "caution"
              ? "border-amber-200 bg-amber-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          <h3 className="text-sm font-semibold text-gray-800">IP terms</h3>
          <p className="mt-1 text-sm text-gray-600">{competition.ipTerms.summary}</p>
          <label className="mt-3 flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={ipAgreed}
              onChange={(e) => setIpAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4  border-gray-300 accent-gray-800"
            />
            <span className="text-sm text-gray-700">
              I have read and agree to these IP terms
            </span>
          </label>
        </div>
      )}

      {error && (
        <div className=" bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => handleSave(false)}
          disabled={isBusy}
          className="flex-1"
        >
          {isBusy ? "Saving…" : "Save draft"}
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={isBusy}
          className="flex-1"
        >
          {isBusy
            ? "Submitting…"
            : isAlreadySubmitted
            ? "Update entry"
            : "Submit entry"}
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400">Free to submit, always.</p>
    </div>
  );
}
