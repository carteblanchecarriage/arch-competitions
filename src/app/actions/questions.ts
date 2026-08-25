"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface CompetitionQuestion {
  id: string;
  competitionId: string;
  askerName: string;
  question: string;
  answer: string | null;
  answeredAt: string | null;
  answeredBy: string | null;
  createdAt: string;
}

/** Public — returns all questions for a competition ordered oldest first. */
export async function getQuestions(competitionId: string): Promise<CompetitionQuestion[]> {
  const { data, error } = await supabaseAdmin()
    .from("competition_questions")
    .select("*")
    .eq("competition_id", competitionId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    competitionId: row.competition_id,
    askerName: row.asker_name,
    question: row.question,
    answer: row.answer ?? null,
    answeredAt: row.answered_at ?? null,
    answeredBy: row.answered_by ?? null,
    createdAt: row.created_at,
  }));
}

/** Requires the user to be a registered designer for this competition. */
export async function askQuestion(
  accessToken: string,
  competitionId: string,
  question: string
): Promise<CompetitionQuestion> {
  if (!question.trim()) throw new Error("Question cannot be empty.");

  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id, name")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!sub) throw new Error("You need a profile before you can ask questions.");

  const { data: reg } = await db
    .from("competition_registrations")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("submitter_id", sub.id)
    .maybeSingle();

  if (!reg) throw new Error("You must register for this competition before asking questions.");

  const { data, error } = await db
    .from("competition_questions")
    .insert({
      competition_id: competitionId,
      asker_id: sub.id,
      asker_name: sub.name,
      question: question.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return {
    id: data.id,
    competitionId: data.competition_id,
    askerName: data.asker_name,
    question: data.question,
    answer: null,
    answeredAt: null,
    answeredBy: null,
    createdAt: data.created_at,
  };
}

/**
 * Requires the user to be the organizer of the competition, or a listed juror.
 * Jurors are matched by their submitter slug appearing in the competition jury array.
 */
export async function answerQuestion(
  accessToken: string,
  questionId: string,
  answer: string
): Promise<void> {
  if (!answer.trim()) throw new Error("Answer cannot be empty.");

  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  // Resolve the question and its competition
  const { data: q } = await db
    .from("competition_questions")
    .select("id, competition_id")
    .eq("id", questionId)
    .maybeSingle();

  if (!q) throw new Error("Question not found.");

  const { data: comp } = await db
    .from("competitions")
    .select("organizer_id, jury")
    .eq("id", q.competition_id)
    .maybeSingle();

  if (!comp) throw new Error("Competition not found.");

  // Check if user is the organizer
  const { data: org } = await db
    .from("organizers")
    .select("id, name")
    .eq("id", comp.organizer_id)
    .eq("privy_user_id", userId)
    .maybeSingle();

  let answererName: string | null = org?.name ?? null;

  // If not organizer, check if user is a listed juror
  if (!org) {
    const { data: sub } = await db
      .from("submitters")
      .select("slug, name")
      .eq("privy_user_id", userId)
      .maybeSingle();

    const jury: { submitterSlug?: string }[] = comp.jury ?? [];
    const isJuror = sub && jury.some((j) => j.submitterSlug === sub.slug);

    if (!isJuror) throw new Error("Only the organizer or listed jurors can answer questions.");
    answererName = sub!.name;
  }

  const { error } = await db
    .from("competition_questions")
    .update({
      answer: answer.trim(),
      answered_at: new Date().toISOString(),
      answered_by: answererName,
    })
    .eq("id", questionId);

  if (error) throw new Error(error.message);
}
