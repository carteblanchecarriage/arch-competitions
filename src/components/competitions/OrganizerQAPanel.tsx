"use client";

import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/Button";
import { getQuestions, answerQuestion, type CompetitionQuestion } from "@/app/actions/questions";
import { formatDate } from "@/lib/utils";

export function OrganizerQAPanel({ competitionId }: { competitionId: string }) {
  const { getAccessToken } = usePrivy();
  const [questions, setQuestions] = useState<CompetitionQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getQuestions(competitionId)
      .then(setQuestions)
      .finally(() => setLoading(false));
  }, [competitionId]);

  async function handleAnswer(questionId: string) {
    const answer = answerDrafts[questionId]?.trim();
    if (!answer) return;
    setSubmitting(questionId);
    setErrors((e) => ({ ...e, [questionId]: "" }));
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in.");
      await answerQuestion(token, questionId, answer);
      setQuestions((qs) =>
        qs.map((q) =>
          q.id === questionId
            ? { ...q, answer, answeredAt: new Date().toISOString(), answeredBy: "You" }
            : q
        )
      );
      setAnswerDrafts((d) => ({ ...d, [questionId]: "" }));
    } catch (e) {
      setErrors((prev) => ({
        ...prev,
        [questionId]: e instanceof Error ? e.message : "Failed to post answer.",
      }));
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2 px-6 py-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse  bg-gray-100" />
        ))}
      </div>
    );
  }

  const unanswered = questions.filter((q) => !q.answer);
  const answered = questions.filter((q) => q.answer);

  if (questions.length === 0) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-400">
        No questions yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-50">
      {/* Unanswered */}
      {unanswered.length > 0 && (
        <div>
          <div className="border-b border-gray-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Needs answer — {unanswered.length}
          </div>
          <div className="divide-y divide-gray-50">
            {unanswered.map((q) => (
              <div key={q.id} className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {q.askerName} Â· {formatDate(q.createdAt)}
                </p>
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={2}
                    value={answerDrafts[q.id] ?? ""}
                    onChange={(e) =>
                      setAnswerDrafts((d) => ({ ...d, [q.id]: e.target.value }))
                    }
                    placeholder="Write an answer…"
                    disabled={submitting === q.id}
                    className="w-full  border border-gray-200 px-3 py-2 text-sm focus:border-gray-400 focus:outline-none disabled:bg-gray-50 resize-none"
                  />
                  {errors[q.id] && (
                    <p className="text-xs text-red-600">{errors[q.id]}</p>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleAnswer(q.id)}
                    disabled={submitting === q.id || !answerDrafts[q.id]?.trim()}
                  >
                    {submitting === q.id ? "Posting…" : "Post answer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Answered */}
      {answered.length > 0 && (
        <div>
          <div className="border-b border-gray-100 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Answered — {answered.length}
          </div>
          <div className="divide-y divide-gray-50">
            {answered.map((q) => (
              <div key={q.id} className="px-6 py-4 opacity-70">
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {q.askerName} Â· {formatDate(q.createdAt)}
                </p>
                <div className="mt-2 border-l-2 border-gray-200 pl-3">
                  <p className="text-sm text-gray-700">{q.answer}</p>
                  {q.answeredAt && (
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(q.answeredAt)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
