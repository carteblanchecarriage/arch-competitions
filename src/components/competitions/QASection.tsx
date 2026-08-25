"use client";

import { useState, useEffect, useRef } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { askQuestion, type CompetitionQuestion } from "@/app/actions/questions";
import { getMyRegistration } from "@/app/actions/registration";
import { formatDate } from "@/lib/utils";

export function QASection({
  competitionId,
  initialQuestions,
}: {
  competitionId: string;
  initialQuestions: CompetitionQuestion[];
}) {
  const { ready, authenticated, login, getAccessToken } = usePrivy();
  const [questions, setQuestions] = useState(initialQuestions);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingReg, setCheckingReg] = useState(true);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) { setCheckingReg(false); return; }
    getAccessToken().then(async (token) => {
      if (!token) { setCheckingReg(false); return; }
      try {
        const reg = await getMyRegistration(token, competitionId);
        setIsRegistered(reg);
      } finally {
        setCheckingReg(false);
      }
    });
  }, [ready, authenticated, competitionId]);

  async function handleSubmit() {
    if (!draft.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getAccessToken();
      if (!token) { login(); return; }
      const newQ = await askQuestion(token, competitionId, draft);
      setQuestions((qs) => [...qs, newQ]);
      setDraft("");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-900">Q&amp;A</h2>
        {questions.length > 0 && (
          <span className=" bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            {questions.length}
          </span>
        )}
      </div>

      {/* Question list */}
      {questions.length === 0 ? (
        <p className="text-sm text-gray-400">No questions yet. Be the first.</p>
      ) : (
        <div className="space-y-5">
          {questions.map((q) => (
            <div key={q.id} className=" border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                {!q.answer && (
                  <span className="shrink-0  bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600">
                    Awaiting answer
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {q.askerName} Â· {formatDate(q.createdAt)}
              </p>

              {q.answer && (
                <div className="mt-3 border-l-2 border-gray-300 pl-3">
                  <p className="text-sm text-gray-700">{q.answer}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {q.answeredBy && `${q.answeredBy} Â· `}
                    {q.answeredAt && formatDate(q.answeredAt)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask form */}
      <div className="mt-6">
        {!ready || checkingReg ? (
          <div className="h-10 w-48 animate-pulse  bg-gray-100" />
        ) : !authenticated ? (
          <p className="text-sm text-gray-500">
            <button onClick={login} className="font-medium text-gray-900 underline decoration-gray-400 hover:decoration-gray-700">
              Sign in
            </button>{" "}
            and register to ask a question.
          </p>
        ) : !isRegistered ? (
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Register for this competition</span> to ask questions.
          </p>
        ) : (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask the organizer a question…"
              disabled={submitting}
              className="w-full  border border-gray-200 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 resize-none"
            />
            {submitError && (
              <p className="text-xs text-red-600">{submitError}</p>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !draft.trim()}
            >
              {submitting ? "Posting…" : "Post question"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
