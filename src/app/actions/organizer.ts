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

export interface OrganizerCompetition {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "open" | "judging" | "announced";
  submissionDeadline: string;
  entryCount: number;
  escrowAddress: string | null;
  chainId: number | null;
  totalAmount: number;
  isOpenPool: boolean;
}

export interface DashboardEntry {
  id: string;
  title: string;
  description: string;
  projectUrl: string | null;
  files: EntryFile[];
  status: "draft" | "submitted" | "withdrawn";
  submittedAt: string | null;
  createdAt: string;
  submitter: {
    slug: string;
    name: string;
    country: string;
    type: "individual" | "studio";
  };
}

/** Returns the organizer record for the currently logged-in user, or null. */
export async function getMyOrganizer(
  accessToken: string
): Promise<{ id: string; slug: string; name: string } | null> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const { data } = await supabaseAdmin()
    .from("organizers")
    .select("id, slug, name")
    .eq("privy_user_id", userId)
    .maybeSingle();
  return data as { id: string; slug: string; name: string } | null;
}

/**
 * Returns all competitions for the logged-in organizer, each with a
 * count of submitted entries.
 */
export async function getOrganizerDashboard(accessToken: string): Promise<{
  organizerSlug: string;
  competitions: OrganizerCompetition[];
}> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: org } = await db
    .from("organizers")
    .select("id, slug")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!org) throw new Error("No organizer account found.");

  const { data: comps, error } = await db
    .from("competitions")
    .select("id, slug, title, status, submission_deadline, escrow_address, chain_id, prize_total_amount, is_open_pool")
    .eq("organizer_id", org.id)
    .order("submission_deadline", { ascending: false });

  if (error) throw new Error(error.message);
  if (!comps?.length) return { organizerSlug: org.slug, competitions: [] };

  // Fetch submitted entry counts for all competitions in one query
  const compIds = comps.map((c) => c.id);
  const { data: submitted } = await db
    .from("entries")
    .select("competition_id")
    .in("competition_id", compIds)
    .eq("status", "submitted");

  const countByComp: Record<string, number> = {};
  for (const e of submitted ?? []) {
    countByComp[e.competition_id] = (countByComp[e.competition_id] ?? 0) + 1;
  }

  return {
    organizerSlug: org.slug,
    competitions: comps.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      status: c.status,
      submissionDeadline: c.submission_deadline,
      entryCount: countByComp[c.id] ?? 0,
      escrowAddress: c.escrow_address ?? null,
      chainId: c.chain_id ?? null,
      totalAmount: Number(c.prize_total_amount ?? 0),
      isOpenPool: c.is_open_pool ?? false,
    })),
  };
}

/**
 * Returns all non-withdrawn entries for a competition the caller owns,
 * joined with basic submitter info. Submitted entries first, then drafts.
 */
export async function getCompetitionEntries(
  accessToken: string,
  competitionId: string
): Promise<DashboardEntry[]> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  // Verify ownership
  const { data: org } = await db
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!org) throw new Error("No organizer account found.");

  const { data: comp } = await db
    .from("competitions")
    .select("id")
    .eq("id", competitionId)
    .eq("organizer_id", org.id)
    .maybeSingle();

  if (!comp) throw new Error("Competition not found or access denied.");

  const { data: entries, error } = await db
    .from("entries")
    .select("*, submitter:submitters(slug, name, country, type)")
    .eq("competition_id", competitionId)
    .neq("status", "withdrawn")
    .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  return (entries ?? []).map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    projectUrl: e.project_url,
    files: e.files ?? [],
    status: e.status,
    submittedAt: e.submitted_at,
    createdAt: e.created_at,
    submitter: e.submitter,
  }));
}
