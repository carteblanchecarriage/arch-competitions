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

async function assignAnonymousId(
  db: ReturnType<typeof supabaseAdmin>,
  competitionId: string
): Promise<string> {
  const { count } = await db
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("competition_id", competitionId)
    .not("anonymous_id", "is", null);
  const n = (count ?? 0) + 1;
  return `E-${String(n).padStart(4, "0")}`;
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
  submitterSlug?: string;
  anonymous_id: string | null;
  title: string;
  description: string;
  project_url: string | null;
  files: EntryFile[];
  status: "draft" | "submitted" | "withdrawn";
  hidden_by_submitter: boolean;
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
    .select("*, submitter:submitters(slug)")
    .eq("competition_id", competitionId)
    .eq("submitter_id", sub.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const { submitter, ...rest } = data as EntryRow & { submitter?: { slug: string } };
  return { ...rest, submitterSlug: submitter?.slug };
}

/**
 * Show or hide the caller's entry from the public gallery.
 * Winning entries cannot be hidden.
 */
export async function setEntryVisibility(
  accessToken: string,
  entryId: string,
  hidden: boolean,
): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id, slug")
    .eq("privy_user_id", userId)
    .maybeSingle();
  if (!sub) throw new Error("No submitter profile found.");

  const { data: entry } = await db
    .from("entries")
    .select("id, competition_id, submitter_id")
    .eq("id", entryId)
    .eq("submitter_id", sub.id)
    .maybeSingle();
  if (!entry) throw new Error("Entry not found or access denied.");

  // Prevent hiding a winning entry
  const { data: comp } = await db
    .from("competitions")
    .select("results")
    .eq("id", entry.competition_id)
    .maybeSingle();

  const winners: { submitterSlug?: string }[] = comp?.results?.winners ?? [];
  const isWinner = winners.some((w) => w.submitterSlug === sub.slug);
  if (isWinner && hidden) throw new Error("Winning entries cannot be hidden.");

  const { error } = await db
    .from("entries")
    .update({ hidden_by_submitter: hidden })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
}

/**
 * Formally withdraw an entry from the competition.
 * Only allowed while the competition is still open and before the deadline.
 * Withdrawn entries are excluded from judging and the public gallery.
 */
export async function withdrawEntry(
  accessToken: string,
  entryId: string
): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();
  if (!sub) throw new Error("No submitter profile found.");

  const { data: entry } = await db
    .from("entries")
    .select("id, competition_id, submitter_id, status")
    .eq("id", entryId)
    .eq("submitter_id", sub.id)
    .maybeSingle();
  if (!entry) throw new Error("Entry not found or access denied.");
  if (entry.status === "withdrawn") throw new Error("Entry is already withdrawn.");

  const { data: comp } = await db
    .from("competitions")
    .select("status, submission_deadline")
    .eq("id", entry.competition_id)
    .maybeSingle();
  if (!comp) throw new Error("Competition not found.");
  if (comp.status !== "open") throw new Error("Entries can only be withdrawn while the competition is open.");
  if (new Date(comp.submission_deadline) < new Date()) throw new Error("The submission deadline has passed.");

  const { error } = await db
    .from("entries")
    .update({ status: "withdrawn" })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
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

  // Check if an anonymous_id already exists for this entry (re-submits preserve it)
  const { data: existing } = await db
    .from("entries")
    .select("anonymous_id")
    .eq("competition_id", competitionId)
    .eq("submitter_id", sub.id)
    .maybeSingle();

  let anonymousId = existing?.anonymous_id ?? null;
  if (submit && !anonymousId) {
    anonymousId = await assignAnonymousId(db, competitionId);
  }

  const payload = {
    competition_id: competitionId,
    submitter_id: sub.id,
    anonymous_id: anonymousId,
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
