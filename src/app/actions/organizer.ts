"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";
import type { EntryFile, JuryMember } from "@/data/types";

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
  originalSubmissionDeadline: string;
  createdAt: string;
  entryCount: number;
  escrowAddress: string | null;
  chainId: number | null;
  totalAmount: number;
  isOpenPool: boolean;
  prizeBreakdown: { place: string; amount: number }[];
  jury: JuryMember[];
}

export interface DashboardEntry {
  id: string;
  anonymousId: string | null;
  title: string;
  description: string;
  projectUrl: string | null;
  files: EntryFile[];
  status: "draft" | "submitted" | "withdrawn";
  submittedAt: string | null;
  createdAt: string;
  // null when anonymous judging is active (competition not yet announced)
  submitter: {
    slug: string;
    name: string;
    country: string;
    type: "individual" | "studio";
  } | null;
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
    .select("id, slug, title, status, submission_deadline, original_submission_deadline, created_at, escrow_address, chain_id, prize_total_amount, is_open_pool, prize_breakdown, jury")
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
      originalSubmissionDeadline: c.original_submission_deadline ?? c.submission_deadline,
      createdAt: c.created_at,
      entryCount: countByComp[c.id] ?? 0,
      escrowAddress: c.escrow_address ?? null,
      chainId: c.chain_id ?? null,
      totalAmount: Number(c.prize_total_amount ?? 0),
      isOpenPool: c.is_open_pool ?? false,
      prizeBreakdown: (c.prize_breakdown ?? []) as { place: string; amount: number }[],
      jury: (c.jury ?? []) as JuryMember[],
    })),
  };
}

/**
 * Returns all non-withdrawn entries for a competition the caller owns.
 * Submitter identity is withheld until the competition is announced —
 * enforcing anonymous judging per the UIA Accord on Competitions.
 * Submitted entries first, then drafts.
 */
export async function getCompetitionEntries(
  accessToken: string,
  competitionId: string
): Promise<DashboardEntry[]> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: org } = await db
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!org) throw new Error("No organizer account found.");

  const { data: comp } = await db
    .from("competitions")
    .select("id, status")
    .eq("id", competitionId)
    .eq("organizer_id", org.id)
    .maybeSingle();

  if (!comp) throw new Error("Competition not found or access denied.");

  const announced = comp.status === "announced";

  const { data: entries, error } = announced
    ? await db
        .from("entries")
        .select("*, submitter:submitters(slug, name, country, type)")
        .eq("competition_id", competitionId)
        .neq("status", "withdrawn")
        .order("submitted_at", { ascending: false, nullsFirst: false })
    : await db
        .from("entries")
        .select("id, anonymous_id, title, description, project_url, files, status, submitted_at, created_at")
        .eq("competition_id", competitionId)
        .neq("status", "withdrawn")
        .order("submitted_at", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);

  return (entries ?? []).map((e) => ({
    id: e.id,
    anonymousId: e.anonymous_id ?? null,
    title: e.title,
    description: e.description,
    projectUrl: e.project_url,
    files: e.files ?? [],
    status: e.status,
    submittedAt: e.submitted_at,
    createdAt: e.created_at,
    submitter: announced ? (e as { submitter: DashboardEntry["submitter"] }).submitter : null,
  }));
}

export interface WinnerPick {
  tierIndex: number;
  entryId: string;
  juryStatement?: string;
}

/**
 * Saves winner selections and moves the competition to "announced".
 * Caller must be the organizer of the competition.
 */
export async function announceWinners(
  accessToken: string,
  competitionId: string,
  picks: WinnerPick[],
  jurySummary: string,
): Promise<void> {
  if (!jurySummary.trim()) throw new Error("A jury report is required before announcing results (UIA requirement).");
  if (jurySummary.trim().length < 50) throw new Error("Jury report must be at least 50 characters. Describe how the jury reached its decision.");
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: org } = await db
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();
  if (!org) throw new Error("No organizer account found.");

  const { data: comp } = await db
    .from("competitions")
    .select("id, status, prize_breakdown, net_to_winners, is_open_pool")
    .eq("id", competitionId)
    .eq("organizer_id", org.id)
    .maybeSingle();
  if (!comp) throw new Error("Competition not found or access denied.");
  if (comp.status === "announced") throw new Error("Winners already announced.");

  const breakdown: { place: string; amount: number }[] = comp.prize_breakdown ?? [];

  // Fetch the selected entries with submitter info
  const entryIds = picks.map((p) => p.entryId).filter(Boolean);
  const { data: entries } = await db
    .from("entries")
    .select("id, title, description, files, submitter:submitters(slug, name, type)")
    .in("id", entryIds)
    .eq("competition_id", competitionId);

  const entryById = Object.fromEntries((entries ?? []).map((e) => [e.id, e]));

  const winners = picks
    .filter((p) => p.entryId && entryById[p.entryId])
    .map((p) => {
      const entry = entryById[p.entryId];
      const tier = breakdown[p.tierIndex] ?? { place: `Place ${p.tierIndex + 1}`, amount: 0 };
      const submitter = entry.submitter as { slug: string; name: string; type: string } | null;
      const images: string[] = (entry.files ?? [])
        .filter((f: { mimeType?: string }) => f.mimeType?.startsWith("image/"))
        .map((f: { url: string }) => f.url)
        .slice(0, 3);
      return {
        place: tier.place,
        designerName: submitter?.name ?? "Unknown",
        submitterSlug: submitter?.slug ?? undefined,
        projectTitle: entry.title,
        description: entry.description ?? "",
        images,
        juryStatement: p.juryStatement?.trim() || undefined,
        prizeAmount: tier.amount,
        paidOut: false,
      };
    });

  const results = { winners, jurySummary: jurySummary?.trim() || undefined };

  const { error } = await db
    .from("competitions")
    .update({ results, status: "announced" })
    .eq("id", competitionId);

  if (error) throw new Error(`Failed to save results: ${error.message}`);
}

const MS_24H = 24 * 60 * 60 * 1000;
const MS_90_DAYS = 90 * 24 * 60 * 60 * 1000;

/**
 * Update the submission deadline for a competition the caller owns.
 *
 * Rules:
 *  - Within 24 h of creation: any deadline is allowed (shorten or extend).
 *  - After 24 h: can only extend, and new deadline must be ≤ original + 90 days.
 */
export async function updateCompetitionDeadline(
  accessToken: string,
  competitionId: string,
  newDeadline: string,
): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: org } = await db
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();
  if (!org) throw new Error("No organizer account found.");

  const { data: comp } = await db
    .from("competitions")
    .select("id, status, created_at, submission_deadline, original_submission_deadline")
    .eq("id", competitionId)
    .eq("organizer_id", org.id)
    .maybeSingle();
  if (!comp) throw new Error("Competition not found or access denied.");

  const now = Date.now();
  const createdAt = new Date(comp.created_at).getTime();
  const withinGracePeriod = now - createdAt < MS_24H;

  const newDeadlineMs = new Date(newDeadline).getTime();
  const currentDeadlineMs = new Date(comp.submission_deadline).getTime();
  const originalDeadlineMs = new Date(
    comp.original_submission_deadline ?? comp.submission_deadline
  ).getTime();

  if (!withinGracePeriod) {
    if (newDeadlineMs < currentDeadlineMs) {
      throw new Error("You can only shorten the deadline within 24 hours of creating the competition.");
    }
    const maxDeadlineMs = originalDeadlineMs + MS_90_DAYS;
    if (newDeadlineMs > maxDeadlineMs) {
      const maxDate = new Date(maxDeadlineMs).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      throw new Error(`Deadline cannot exceed 3 months past the original date (${maxDate}).`);
    }
  }

  // Fetch current updates so we can append without overwriting
  const { data: current } = await db
    .from("competitions")
    .select("updates")
    .eq("id", comp.id)
    .single();

  const existingUpdates = (current?.updates ?? []) as object[];
  const deadlineUpdate = {
    date: new Date().toISOString(),
    author: "Organizer",
    title: "Submission deadline updated",
    content: `The submission deadline has been extended to ${new Date(newDeadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`,
  };

  const { error } = await db
    .from("competitions")
    .update({
      submission_deadline: newDeadline,
      updates: [...existingUpdates, deadlineUpdate],
    })
    .eq("id", comp.id);

  if (error) throw new Error(`Failed to update deadline: ${error.message}`);
}

/**
 * Replace the jury for a competition the caller owns.
 * Allowed at any status — organizers can set or update jury before, during, or after submissions.
 */
export async function updateJury(
  accessToken: string,
  competitionId: string,
  jury: JuryMember[],
): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

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

  const { error } = await db
    .from("competitions")
    .update({ jury })
    .eq("id", comp.id);

  if (error) throw new Error(`Failed to update jury: ${error.message}`);
}
