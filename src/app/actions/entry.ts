"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";
import type { EntryFile } from "@/data/types";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface EntryInput {
  title: string;
  description: string;
  projectUrl?: string;
  files: EntryFile[];
}

export interface EntryRow {
  id: string;
  competition_id: string;
  submitter_id: string;
  title: string;
  description: string;
  project_url: string | null;
  files: EntryFile[];
  status: "draft" | "submitted" | "withdrawn";
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Returns the current user's entry for the given competition, or null. */
export async function getMyEntry(
  accessToken: string,
  competitionId: string
): Promise<EntryRow | null> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!sub) return null;

  const { data, error } = await db
    .from("entries")
    .select("*")
    .eq("competition_id", competitionId)
    .eq("submitter_id", sub.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EntryRow | null;
}

/**
 * Create or update an entry. Pass submit=true to finalise.
 * Submitted entries can be updated again until the deadline.
 */
export async function saveEntry(
  accessToken: string,
  competitionId: string,
  input: EntryInput,
  submit: boolean
): Promise<EntryRow> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!sub) throw new Error("You need a profile before you can submit an entry.");

  const { data: comp } = await db
    .from("competitions")
    .select("status, submission_deadline")
    .eq("id", competitionId)
    .maybeSingle();

  if (!comp) throw new Error("Competition not found.");
  if (comp.status !== "open") throw new Error("This competition is no longer accepting entries.");
  if (new Date(comp.submission_deadline) < new Date()) throw new Error("The submission deadline has passed.");
  if (!input.title.trim()) throw new Error("A project title is required.");

  const payload = {
    competition_id: competitionId,
    submitter_id: sub.id,
    title: input.title.trim(),
    description: input.description,
    project_url: input.projectUrl?.trim() || null,
    files: input.files,
    status: submit ? "submitted" : "draft",
    submitted_at: submit ? new Date().toISOString() : null,
  };

  const { data, error } = await db
    .from("entries")
    .upsert(payload, { onConflict: "competition_id,submitter_id" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as EntryRow;
}
