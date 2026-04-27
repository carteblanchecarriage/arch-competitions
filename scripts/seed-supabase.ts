/**
 * Seed Supabase from the mock data in src/data/.
 *
 * Usage:
 *   1. In Supabase dashboard → Settings → API, copy the **service_role** key
 *      (NOT the publishable/anon key — service_role bypasses RLS, which we need
 *      for inserts since we haven't set up write policies yet).
 *   2. Add to .env.local TEMPORARILY (don't commit):
 *        SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
 *   3. Run: npm run seed
 *   4. Remove the service-role key from .env.local once seeded.
 *
 * Idempotent — uses upsert on slug, so re-running updates existing rows.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { competitions } from "../src/data/competitions";
import { organizers } from "../src/data/organizers";
import { submitters } from "../src/data/submitters";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  // 1. Organizers — Record<string, Organizer> in mock data; flatten to array.
  //    The original mock `id` becomes the slug column (stable cross-environment key).
  const orgRows = Object.values(organizers).map((o) => ({
    slug: o.id,
    name: o.name,
    logo: o.logo ?? null,
    description: o.description,
    website: o.website ?? null,
    is_verified: o.isVerified,
    competitions_count: o.competitionsCount,
    payout_completion_rate: o.payoutCompletionRate,
  }));

  const orgRes = await supabase
    .from("organizers")
    .upsert(orgRows, { onConflict: "slug" })
    .select("id, slug");

  if (orgRes.error) throw new Error(`organizers: ${orgRes.error.message}`);
  const orgIdBySlug = Object.fromEntries(orgRes.data!.map((o) => [o.slug, o.id]));
  console.log(`✓ Upserted ${orgRes.data!.length} organizers`);

  // 2. Submitters
  const submRows = submitters.map((s) => ({
    slug: s.slug,
    name: s.name,
    type: s.type,
    photo: s.photo ?? null,
    country: s.country,
    city: s.city ?? null,
    bio: s.bio,
    specialties: s.specialties,
    website: s.website ?? null,
    year_established: s.yearEstablished ?? null,
  }));

  const submRes = await supabase
    .from("submitters")
    .upsert(submRows, { onConflict: "slug" })
    .select("id, slug");

  if (submRes.error) throw new Error(`submitters: ${submRes.error.message}`);
  console.log(`✓ Upserted ${submRes.data!.length} submitters`);

  // 3. Competitions — flatten prizePool + ipTerms into columns, nest jury etc as jsonb
  const compRows = competitions.map((c) => {
    const orgId = orgIdBySlug[c.organizer.id];
    if (!orgId) {
      throw new Error(`Organizer not found for competition ${c.slug}: ${c.organizer.id}`);
    }
    return {
      slug: c.slug,
      organizer_id: orgId,
      title: c.title,
      short_description: c.shortDescription,
      brief: c.brief,
      design_objectives: c.designObjectives,
      site_context: c.siteContext,
      background: c.background,
      type: c.type,
      status: c.status,
      eligibility: c.eligibility,
      tags: c.tags,
      location: c.location,
      region: c.region,
      language: c.language,
      hero_image: c.heroImage,
      thumbnail_image: c.thumbnailImage,
      registration_deadline: c.registrationDeadline,
      submission_deadline: c.submissionDeadline,
      judging_start: c.judgingStart,
      judging_end: c.judgingEnd,
      announcement_date: c.announcementDate,
      // Prize pool flat
      prize_total_amount: c.prizePool.totalAmount,
      prize_currency: c.prizePool.currency,
      prize_breakdown: c.prizePool.breakdown,
      is_open_pool: c.prizePool.isOpenPool,
      contributor_count: c.prizePool.contributorCount,
      platform_fee_percent: c.prizePool.platformFeePercent,
      net_to_winners: c.prizePool.netToWinners,
      funding_status: c.prizePool.fundingStatus,
      paid_out_date: c.prizePool.paidOutDate ?? null,
      // Nested blobs
      jury: c.jury,
      evaluation_criteria: c.evaluationCriteria,
      deliverables: c.deliverables,
      // IP terms flat
      ip_terms_type: c.ipTerms.type,
      ip_terms_summary: c.ipTerms.summary,
      ip_terms_full: c.ipTerms.fullText,
      ip_terms_applies_to_all: c.ipTerms.appliesToAllEntries,
      ip_terms_is_default: c.ipTerms.isDefault,
      ip_terms_warning_level: c.ipTerms.warningLevel,
      // Optional post-competition + lifecycle
      results: c.results ?? null,
      updates: c.updates ?? [],
      created_at: c.createdAt,
    };
  });

  const compRes = await supabase
    .from("competitions")
    .upsert(compRows, { onConflict: "slug" })
    .select("slug");

  if (compRes.error) throw new Error(`competitions: ${compRes.error.message}`);
  console.log(`✓ Upserted ${compRes.data!.length} competitions`);

  console.log("\nDone. Verify in dashboard → Table Editor.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
