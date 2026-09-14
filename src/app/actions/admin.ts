"use server";

import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export interface AdminCompetitionRow {
  id: string;
  slug: string;
  title: string;
  status: string;
  organizerName: string;
  createdAt: string;
  submissionDeadline: string;
  adminRemoved: boolean;
  adminRemovedReason: string | null;
}

export async function adminListCompetitions(accessToken: string): Promise<AdminCompetitionRow[]> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("competitions")
    .select(
      "id, slug, title, status, created_at, submission_deadline, admin_removed, admin_removed_reason, organizer:organizers(name)"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    status: c.status,
    organizerName: (c.organizer as { name?: string } | null)?.name ?? "—",
    createdAt: c.created_at,
    submissionDeadline: c.submission_deadline,
    adminRemoved: c.admin_removed,
    adminRemovedReason: c.admin_removed_reason,
  }));
}

export async function adminSetCompetitionRemoved(
  accessToken: string,
  competitionId: string,
  removed: boolean,
  reason?: string
): Promise<void> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { error } = await db
    .from("competitions")
    .update({
      admin_removed: removed,
      admin_removed_reason: removed ? reason?.trim() || null : null,
      admin_removed_at: removed ? new Date().toISOString() : null,
    })
    .eq("id", competitionId);

  if (error) throw new Error(error.message);
}

export interface AdminEntryRow {
  id: string;
  title: string;
  status: string;
  competitionTitle: string;
  competitionSlug: string;
  submitterName: string;
  createdAt: string;
  adminRemoved: boolean;
  adminRemovedReason: string | null;
}

export async function adminListEntries(accessToken: string): Promise<AdminEntryRow[]> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("entries")
    .select(
      "id, title, status, created_at, admin_removed, admin_removed_reason, competition:competitions(title, slug), submitter:submitters(name)"
    )
    .neq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    status: e.status,
    competitionTitle: (e.competition as { title?: string } | null)?.title ?? "—",
    competitionSlug: (e.competition as { slug?: string } | null)?.slug ?? "",
    submitterName: (e.submitter as { name?: string } | null)?.name ?? "—",
    createdAt: e.created_at,
    adminRemoved: e.admin_removed,
    adminRemovedReason: e.admin_removed_reason,
  }));
}

export async function adminSetEntryRemoved(
  accessToken: string,
  entryId: string,
  removed: boolean,
  reason?: string
): Promise<void> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { error } = await db
    .from("entries")
    .update({
      admin_removed: removed,
      admin_removed_reason: removed ? reason?.trim() || null : null,
      admin_removed_at: removed ? new Date().toISOString() : null,
    })
    .eq("id", entryId);

  if (error) throw new Error(error.message);
}

export interface AdminReportRow {
  id: string;
  reason: string;
  details: string | null;
  reporterEmail: string | null;
  createdAt: string;
  competitionId: string | null;
  competitionTitle: string | null;
  competitionSlug: string | null;
  entryId: string | null;
  entryTitle: string | null;
}

export async function adminListReports(accessToken: string): Promise<AdminReportRow[]> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { data, error } = await db
    .from("content_reports")
    .select(
      "id, reason, details, reporter_email, created_at, competition_id, entry_id, competition:competitions(title, slug), entry:entries(title)"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new Error(error.message);

  return (data ?? []).map((r) => ({
    id: r.id,
    reason: r.reason,
    details: r.details,
    reporterEmail: r.reporter_email,
    createdAt: r.created_at,
    competitionId: r.competition_id,
    competitionTitle: (r.competition as { title?: string } | null)?.title ?? null,
    competitionSlug: (r.competition as { slug?: string } | null)?.slug ?? null,
    entryId: r.entry_id,
    entryTitle: (r.entry as { title?: string } | null)?.title ?? null,
  }));
}

export async function adminResolveReport(
  accessToken: string,
  reportId: string,
  status: "resolved" | "dismissed"
): Promise<void> {
  await requireAdmin(accessToken);
  const db = supabaseAdmin();

  const { error } = await db
    .from("content_reports")
    .update({ status, resolved_at: new Date().toISOString() })
    .eq("id", reportId);

  if (error) throw new Error(error.message);
}
