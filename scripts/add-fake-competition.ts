/**
 * One-off: insert a single fake competition directly into Supabase for demo/testing.
 * Reuses an existing seeded organizer (civic-design-lab) if present, otherwise creates it.
 *
 * Usage: npm run add-fake-competition
 * Idempotent — upserts on slug, safe to re-run.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const ORG_SLUG = "civic-design-lab";
const COMP_SLUG = "riverside-crossing-pavilion";

function unsplash(photoId: string, w = 1200, h = 800) {
  return `https://images.unsplash.com/${photoId}?w=${w}&h=${h}&fit=crop&q=80`;
}

async function main() {
  let { data: organizer } = await db
    .from("organizers")
    .select("id")
    .eq("slug", ORG_SLUG)
    .maybeSingle();

  if (!organizer) {
    const { data: newOrg, error: orgErr } = await db
      .from("organizers")
      .insert({
        slug: ORG_SLUG,
        name: "Civic Design Lab",
        description:
          "Municipal design office partnering with communities to reimagine public spaces through participatory design processes.",
        is_verified: true,
        competitions_count: 6,
        payout_completion_rate: 83,
      })
      .select("id")
      .single();

    if (orgErr) throw new Error(`organizer: ${orgErr.message}`);
    organizer = newOrg;
    console.log(`✓ Created organizer ${ORG_SLUG}`);
  } else {
    console.log(`✓ Reusing existing organizer ${ORG_SLUG}`);
  }

  // Aerial drone shot of a river, bridge, and mid-rise riverfront buildings —
  // matches the fictional Millhaven setting without showing a recognizable landmark.
  const heroImage = unsplash("photo-1556767302-9cc8328e12f5");

  const { error: compErr } = await db.from("competitions").upsert(
    {
      slug: COMP_SLUG,
      organizer_id: organizer.id,
      title: "Riverside Crossing: A Pedestrian Bridge & Overlook Pavilion",
      short_description:
        "Design a pedestrian bridge and riverside overlook pavilion reconnecting two neighborhoods long divided by a flood-control channel.",
      brief: `Millhaven's flood-control channel has done its job for sixty years — and cut the Eastside and the downtown core off from each other for just as long. The nearest crossing is a half-mile detour over a four-lane arterial with no sidewalk buffer. Kids walk it to school. Most people drive it instead.

The city is funding a new pedestrian bridge at the channel's narrowest point, paired with a small overlook pavilion on the downtown bank. This competition asks designers to treat the crossing as more than infrastructure — as a piece of civic space in its own right, somewhere people choose to linger, not just pass through.

The bridge span is roughly 140 feet. The pavilion program is modest: covered seating, a small vendor kiosk shell (fit-out excluded), bike parking, and lighting for use after dark. Structural ambition is welcome; budget discipline is required.`,
      design_objectives: [
        "Create a crossing that functions as public space, not just circulation infrastructure",
        "Design for comfortable use after dark — lighting, sightlines, and passive surveillance",
        "Meet flood-control clearance requirements without a dominant structural profile",
        "Keep long-term maintenance costs low given the marine-grade corrosion environment",
        "Make the crossing legible and welcoming from both neighborhoods equally",
      ],
      site_context:
        "The Millhaven Flood Control Channel, downtown reach. A 90-foot-wide concrete channel maintained by the regional water authority, with a minimum clearance requirement over the 100-year flood elevation. The Eastside bank is residential; the downtown bank fronts a small civic plaza slated for renovation the following year.",
      background:
        "Civic Design Lab is Millhaven's municipal design office, running this competition on behalf of the City Council's Eastside Reconnection Initiative, a decade-long program to reverse the effects of mid-century channel and highway construction on the city's east side.",
      type: "open",
      status: "open",
      eligibility: "open_to_all",
      tags: ["civic", "infrastructure", "public-space", "pedestrian"],
      location: "Millhaven, Ohio",
      region: "Midwest US",
      language: "en",
      hero_image: heroImage,
      thumbnail_image: heroImage,
      registration_deadline: "2026-09-10",
      submission_deadline: "2026-11-01",
      original_submission_deadline: "2026-11-01",
      judging_start: "2026-11-08",
      judging_end: "2026-11-22",
      announcement_date: "2026-12-01",
      prize_total_amount: 40000,
      prize_currency: "USD",
      prize_breakdown: [
        { place: "1st Place", amount: 20000 },
        { place: "2nd Place", amount: 12000 },
        { place: "3rd Place", amount: 5000 },
        { place: "Honorable Mention (x3)", amount: 1000 },
      ],
      is_open_pool: false,
      contributor_count: 0,
      platform_fee_percent: 5,
      net_to_winners: 38000,
      funding_status: "funded",
      jury: [
        {
          name: "Priya Ramanathan",
          title: "City Engineer",
          organization: "City of Millhaven",
          bio: "Oversees all municipal infrastructure projects; twelve years focused on multimodal crossings and flood-control-adjacent public works.",
          photo: null,
        },
        {
          name: "Marcus Webb",
          title: "Principal",
          organization: "Webb Structures",
          bio: "Structural engineer specializing in pedestrian bridges, with completed spans across four states.",
          photo: null,
        },
        {
          name: "Dana Iqbal",
          title: "Community Board Chair",
          organization: "Eastside Neighborhood Association",
          bio: "Longtime Eastside resident and organizer for the Reconnection Initiative since its founding.",
          photo: null,
        },
      ],
      evaluation_criteria: [
        { name: "Public benefit", weight: 25, description: "Does this create space people actually want to use, not just cross?" },
        { name: "Design innovation", weight: 30, description: "Originality of the bridge and pavilion concept" },
        { name: "Constructability", weight: 20, description: "Realistic within stated budget and maintenance constraints" },
        { name: "Contextual fit", weight: 25, description: "Legibility and welcome from both neighborhoods" },
      ],
      deliverables: [
        { type: "Site plan", format: "PDF", dimensions: "1:500 min", description: "Bridge alignment and pavilion placement" },
        { type: "Plans, sections, elevations", format: "PDF", dimensions: "1:200", description: "Full drawing set for bridge and pavilion" },
        { type: "Exterior perspective", format: "PDF or JPG", description: "One rendered view from the downtown bank" },
        { type: "Design statement", format: "PDF", maxSize: "500 words", description: "Concept narrative" },
      ],
      ip_terms_type: "non_exclusive_license",
      ip_terms_summary: "Designers retain ownership. The city receives a non-exclusive license to use the winning design for construction.",
      ip_terms_full:
        "Entrants retain full copyright and ownership of their submitted designs. By entering, designers grant Civic Design Lab a non-exclusive, royalty-free license to publish and exhibit submitted work in connection with the competition. If selected as a winner, the designer grants the City of Millhaven a non-exclusive license to use, adapt, and construct the winning design, in consultation with the original designer during detailed design development.",
      ip_terms_applies_to_all: true,
      ip_terms_is_default: true,
      ip_terms_warning_level: "none",
      results: null,
      updates: [],
      created_at: "2026-08-25",
    },
    { onConflict: "slug" }
  );

  if (compErr) throw new Error(`competition: ${compErr.message}`);

  console.log(`✓ Upserted competition ${COMP_SLUG}`);
  console.log(`\nView at /competitions/${COMP_SLUG}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
