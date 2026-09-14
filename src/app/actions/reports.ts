"use server";

import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type ReportReason = "illegal" | "sexual_explicit" | "spam_scam" | "other";

interface ReportInput {
  competitionId?: string;
  entryId?: string;
  reason: ReportReason;
  details?: string;
  reporterEmail?: string;
}

/** No auth required — flagging harmful content shouldn't be gated behind an account. */
export async function reportContent(input: ReportInput): Promise<void> {
  if (!input.competitionId && !input.entryId) throw new Error("Nothing to report.");
  if (input.competitionId && input.entryId) throw new Error("Report one thing at a time.");

  const db = supabaseAdmin();
  const { error } = await db.from("content_reports").insert({
    competition_id: input.competitionId ?? null,
    entry_id: input.entryId ?? null,
    reason: input.reason,
    details: input.details?.trim().slice(0, 2000) || null,
    reporter_email: input.reporterEmail?.trim().slice(0, 320) || null,
  });

  if (error) throw new Error(error.message);
}
