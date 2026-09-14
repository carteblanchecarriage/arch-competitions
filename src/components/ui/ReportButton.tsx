"use client";

import { useState } from "react";
import { reportContent, type ReportReason } from "@/app/actions/reports";

const REASONS: { value: ReportReason; label: string }[] = [
  { value: "illegal", label: "Illegal content" },
  { value: "sexual_explicit", label: "Sexual or explicit content" },
  { value: "spam_scam", label: "Spam or scam" },
  { value: "other", label: "Other" },
];

export function ReportButton({ competitionId }: { competitionId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("illegal");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit() {
    setStatus("sending");
    try {
      await reportContent({ competitionId, reason, details, reporterEmail: email });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function close() {
    setOpen(false);
    setStatus("idle");
    setDetails("");
    setEmail("");
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-gray-300 underline decoration-gray-500 underline-offset-2 hover:text-white"
      >
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={close}
        >
          <div
            className="w-full max-w-sm border border-gray-200 bg-white p-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {status === "sent" ? (
              <>
                <h3 className="text-sm font-semibold text-gray-900">Thanks — we&apos;ll review it.</h3>
                <p className="mt-2 text-xs text-gray-500">Reports go straight to our moderation team.</p>
                <button
                  onClick={close}
                  className="mt-4 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-900">Report this competition</h3>
                <p className="mt-1 text-xs text-gray-500">
                  Flag content that&apos;s illegal, explicit, or otherwise shouldn&apos;t be on Counterparti.
                </p>

                <label className="mt-4 block text-xs font-medium text-gray-700">Reason</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReason)}
                  className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <label className="mt-3 block text-xs font-medium text-gray-700">Details (optional)</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  className="mt-1 w-full resize-none border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />

                <label className="mt-3 block text-xs font-medium text-gray-700">
                  Your email (optional, in case we follow up)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full border border-gray-300 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none"
                />

                {status === "error" && (
                  <p className="mt-2 text-xs text-red-600">Something went wrong — try again.</p>
                )}

                <div className="mt-4 flex justify-end gap-2">
                  <button onClick={close} className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800">
                    Cancel
                  </button>
                  <button
                    onClick={submit}
                    disabled={status === "sending"}
                    className="bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {status === "sending" ? "Sending…" : "Submit report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
