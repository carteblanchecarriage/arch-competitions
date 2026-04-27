import { cache } from "react";
import { getSupabase } from "@/lib/supabase/client";
import type {
  Competition,
  Organizer,
  Submitter,
  PrizePool,
  IPTerms,
  JuryMember,
  EvaluationCriterion,
  Deliverable,
  CompetitionResults,
  LifecycleUpdate,
} from "./types";

// ─── Row → domain mappers ────────────────────────────────────────────
// Supabase returns snake_case columns; the rest of the app expects the
// camelCase shape from `data/types.ts`. Reshape here so consumers don't change.

interface OrganizerRow {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  description: string;
  website: string | null;
  is_verified: boolean;
  competitions_count: number;
  payout_completion_rate: number;
}

interface CompetitionRow {
  id: string;
  slug: string;
  organizer_id: string;
  organizer?: OrganizerRow; // present when joined
  title: string;
  short_description: string;
  brief: string;
  design_objectives: string[];
  site_context: string | null;
  background: string | null;
  type: Competition["type"];
  status: Competition["status"];
  eligibility: Competition["eligibility"];
  tags: string[];
  location: string | null;
  region: string | null;
  language: string;
  hero_image: string | null;
  thumbnail_image: string | null;
  registration_deadline: string | null;
  submission_deadline: string;
  judging_start: string | null;
  judging_end: string | null;
  announcement_date: string | null;
  prize_total_amount: string | number;
  prize_currency: string;
  prize_breakdown: PrizePool["breakdown"];
  is_open_pool: boolean;
  contributor_count: number;
  platform_fee_percent: string | number;
  net_to_winners: string | number;
  funding_status: PrizePool["fundingStatus"];
  paid_out_date: string | null;
  jury: JuryMember[];
  evaluation_criteria: EvaluationCriterion[];
  deliverables: Deliverable[];
  ip_terms_type: IPTerms["type"];
  ip_terms_summary: string;
  ip_terms_full: string;
  ip_terms_applies_to_all: boolean;
  ip_terms_is_default: boolean;
  ip_terms_warning_level: IPTerms["warningLevel"];
  results: CompetitionResults | null;
  updates: LifecycleUpdate[];
  escrow_address: string | null;
  chain_id: number | null;
  prize_share_bps: number[];
  created_at: string;
}

interface SubmitterRow {
  id: string;
  slug: string;
  name: string;
  type: Submitter["type"];
  photo: string | null;
  country: string;
  city: string | null;
  bio: string;
  specialties: string[];
  website: string | null;
  year_established: number | null;
}

function rowToOrganizer(row: OrganizerRow): Organizer {
  return {
    id: row.slug, // mock data used slug-as-id; preserve that contract
    name: row.name,
    logo: row.logo ?? undefined,
    description: row.description,
    website: row.website ?? undefined,
    isVerified: row.is_verified,
    competitionsCount: row.competitions_count,
    payoutCompletionRate: row.payout_completion_rate,
  };
}

function rowToCompetition(row: CompetitionRow): Competition {
  if (!row.organizer) {
    throw new Error(`Competition ${row.slug} loaded without organizer join`);
  }
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    brief: row.brief,
    designObjectives: row.design_objectives,
    siteContext: row.site_context ?? "",
    background: row.background ?? "",
    type: row.type,
    status: row.status,
    eligibility: row.eligibility,
    tags: row.tags,
    location: row.location ?? "",
    region: row.region ?? "",
    language: row.language,
    heroImage: row.hero_image ?? "",
    thumbnailImage: row.thumbnail_image ?? "",
    registrationDeadline: row.registration_deadline ?? "",
    submissionDeadline: row.submission_deadline,
    judgingStart: row.judging_start ?? "",
    judgingEnd: row.judging_end ?? "",
    announcementDate: row.announcement_date ?? "",
    prizePool: {
      totalAmount: Number(row.prize_total_amount),
      currency: row.prize_currency,
      breakdown: row.prize_breakdown,
      isOpenPool: row.is_open_pool,
      contributorCount: row.contributor_count,
      platformFeePercent: Number(row.platform_fee_percent),
      netToWinners: Number(row.net_to_winners),
      fundingStatus: row.funding_status,
      paidOutDate: row.paid_out_date ?? undefined,
    },
    organizer: rowToOrganizer(row.organizer),
    jury: row.jury,
    evaluationCriteria: row.evaluation_criteria,
    deliverables: row.deliverables,
    ipTerms: {
      type: row.ip_terms_type,
      summary: row.ip_terms_summary,
      fullText: row.ip_terms_full,
      appliesToAllEntries: row.ip_terms_applies_to_all,
      isDefault: row.ip_terms_is_default,
      warningLevel: row.ip_terms_warning_level,
    },
    results: row.results ?? undefined,
    updates: row.updates ?? [],
    escrowAddress: row.escrow_address ?? undefined,
    chainId: row.chain_id ?? undefined,
    prizeShareBps: row.prize_share_bps ?? undefined,
    createdAt: row.created_at,
  };
}

function rowToSubmitter(row: SubmitterRow): Submitter {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    photo: row.photo ?? undefined,
    country: row.country,
    city: row.city ?? undefined,
    bio: row.bio,
    specialties: row.specialties,
    website: row.website ?? undefined,
    yearEstablished: row.year_established ?? undefined,
  };
}

const COMPETITION_SELECT = "*, organizer:organizers(*)";

// ─── Competition queries ─────────────────────────────────────────────

export const getAllCompetitions = cache(async (): Promise<Competition[]> => {
  const { data, error } = await getSupabase()
    .from("competitions")
    .select(COMPETITION_SELECT)
    .order("submission_deadline", { ascending: true });

  if (error) throw new Error(`getAllCompetitions: ${error.message}`);
  return (data as CompetitionRow[]).map(rowToCompetition);
});

export const getCompetitionBySlug = cache(
  async (slug: string): Promise<Competition | undefined> => {
    const { data, error } = await getSupabase()
      .from("competitions")
      .select(COMPETITION_SELECT)
      .eq("slug", slug)
      .maybeSingle();

    if (error) throw new Error(`getCompetitionBySlug(${slug}): ${error.message}`);
    if (!data) return undefined;
    return rowToCompetition(data as CompetitionRow);
  }
);

export const getAllSlugs = cache(async (): Promise<string[]> => {
  const { data, error } = await getSupabase().from("competitions").select("slug");
  if (error) throw new Error(`getAllSlugs: ${error.message}`);
  return data.map((r) => r.slug);
});

export const getOpenCompetitions = cache(async (): Promise<Competition[]> => {
  const all = await getAllCompetitions();
  return all.filter((c) => c.status === "open");
});

export const getLastCallCompetitions = cache(async (): Promise<Competition[]> => {
  const all = await getAllCompetitions();
  const now = Date.now();
  return all
    .filter((c) => c.status === "open")
    .filter((c) => {
      const daysLeft = (new Date(c.submissionDeadline).getTime() - now) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 30;
    })
    .sort(
      (a, b) =>
        new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime()
    );
});

export const getFeaturedCompetitions = cache(async (): Promise<Competition[]> => {
  const all = await getAllCompetitions();
  return all.filter((c) => c.prizePool.totalAmount >= 10000 || c.prizePool.isOpenPool);
});

// ─── Submitter queries ────────────────────────────────────────────────

export const getAllSubmitters = cache(async (): Promise<Submitter[]> => {
  const { data, error } = await getSupabase()
    .from("submitters")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(`getAllSubmitters: ${error.message}`);
  return (data as SubmitterRow[]).map(rowToSubmitter);
});

export const getSubmitterBySlug = cache(
  async (slug: string): Promise<Submitter | undefined> => {
    const { data, error } = await getSupabase()
      .from("submitters")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`getSubmitterBySlug(${slug}): ${error.message}`);
    if (!data) return undefined;
    return rowToSubmitter(data as SubmitterRow);
  }
);

export const getAllSubmitterSlugs = cache(async (): Promise<string[]> => {
  const { data, error } = await getSupabase().from("submitters").select("slug");
  if (error) throw new Error(`getAllSubmitterSlugs: ${error.message}`);
  return data.map((r) => r.slug);
});
