// Temporary dev-only seed endpoint — remove before deploying to production
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = "competition-images";
const COMP_SLUG = "portland-head-light-interpretive-center-test";
const ORG_SLUG = "cape-elizabeth-heritage-trust";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const step = searchParams.get("step") ?? "all";

  const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ── Connectivity probe ─────────────────────────────────────────────────────
  if (step === "ping") {
    const { data, error } = await db.from("organizers").select("id").limit(1);
    return NextResponse.json({ ok: !error, error: error?.message, data });
  }

  // ── 1. Upload hero image from .testing folder ──────────────────────────────
  let heroImageUrl: string;

  if (step !== "skip-image") {
    const imagePath = join(process.cwd(), ".testing", "coastal-lighthouse.png");
    const imageBytes = readFileSync(imagePath);
    const storagePath = "testing/cape-elizabeth-lighthouse/hero.png";

    const { error: uploadErr } = await db.storage
      .from(BUCKET)
      .upload(storagePath, imageBytes, { contentType: "image/png", upsert: true });

    if (uploadErr) {
      return NextResponse.json(
        { error: "Image upload failed — try /api/dev/seed-lighthouse?step=skip-image", detail: uploadErr.message },
        { status: 500 }
      );
    }
    heroImageUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
  } else {
    // Fallback: use a public-domain lighthouse photo from Wikimedia
    heroImageUrl =
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Portland_Head_Lighthouse_2009.jpg/1280px-Portland_Head_Lighthouse_2009.jpg";
  }

  // ── 2. Find or create test organizer ──────────────────────────────────────
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
        name: "Cape Elizabeth Heritage Trust",
        description:
          "A nonprofit dedicated to preserving and celebrating the cultural and maritime heritage of Cape Elizabeth and the Maine coast.",
        is_verified: true,
        competitions_count: 1,
        payout_completion_rate: 100,
      })
      .select("id")
      .single();

    if (orgErr) return NextResponse.json({ error: "Org create failed", detail: orgErr.message }, { status: 500 });
    organizer = newOrg;
  }

  // ── 3. Upsert competition ──────────────────────────────────────────────────
  await db.from("competitions").delete().eq("slug", COMP_SLUG);

  const BRIEF = `Portland Head Light, first lit in 1791, is one of the most photographed lighthouses in America. Perched on the rocky promontory of Fort Williams Park in Cape Elizabeth, Maine, it marks the entrance to Portland Harbor and has stood witness to centuries of maritime history.

The Cape Elizabeth Heritage Trust invites architects and designers to propose a new Coastal Interpretive Center adjacent to the lighthouse grounds — a building that can serve as an anchor for visitor education, community gathering, and year-round programming, while respecting the irreplaceable character of one of New England's most beloved landmarks.

The site is a 1.2-acre parcel immediately east of the existing keeper's quarters, currently used as overflow parking. The new building should not exceed 4,500 sq ft and must be sited to preserve sightlines to the lighthouse from Fort Williams Park Road and the existing public viewing platforms.

The program includes: a 200-seat multipurpose lecture hall and community room, a permanent exhibition space on maritime history and lighthouse operations, a working archive and reading room open to researchers by appointment, a café with seasonal outdoor seating facing the ocean, and restrooms serving both the center and the broader park.

Climate resilience is a central concern. The site sits within a coastal flood zone, and the building must be designed with sea-level rise over a 50-year horizon in mind. Proposed strategies for passive ventilation, daylight, and material longevity in a saltwater environment will weigh heavily in jury evaluation.`;

  const SITE_CONTEXT = `Fort Williams Park, Cape Elizabeth, Maine. The 90-acre park occupies a former military installation on Casco Bay, approximately 4 miles south of Portland city center. The site experiences harsh winters, persistent coastal winds, and significant tourist volume (approx. 200,000 annual visitors) concentrated between Memorial Day and Columbus Day. The existing lighthouse and keeper's house are listed on the National Register of Historic Places and any proposal must comply with applicable Secretary of the Interior standards for new construction in historic settings.`;

  const { error: compErr } = await db.from("competitions").insert({
    slug: COMP_SLUG,
    organizer_id: organizer.id,
    title: "Portland Head Light — Coastal Interpretive Center",
    type: "open",
    short_description:
      "Design a new interpretive center adjacent to America's most-photographed lighthouse. A 4,500 sq ft program balancing visitor education, community gathering, and coastal resilience.",
    brief: BRIEF,
    design_objectives: [
      "Integrate sensitively with the historic lighthouse without competing for visual dominance",
      "Address coastal resilience: design for a 50-year sea-level rise horizon on a flood-prone promontory",
      "Create a year-round community anchor that serves tourists and local residents equally",
      "Demonstrate material longevity and low maintenance in a high-salt, high-wind marine environment",
      "Maximize daylighting and passive ventilation strategies appropriate to the Maine climate",
    ],
    site_context: SITE_CONTEXT,
    location: "Cape Elizabeth, Maine",
    region: "Northeast US",
    language: "en",
    status: "open",
    eligibility: "open_to_all",
    tags: ["coastal", "heritage", "cultural", "new-england"],
    registration_deadline: "2026-08-01",
    submission_deadline: "2026-09-15",
    original_submission_deadline: "2026-09-15",
    judging_start: "2026-09-22",
    judging_end: "2026-10-06",
    announcement_date: "2026-10-15",
    prize_total_amount: 15000,
    prize_currency: "USD",
    prize_breakdown: [
      { place: "1st Place", amount: 8550 },
      { place: "2nd Place", amount: 4275 },
      { place: "3rd Place", amount: 1425 },
    ],
    prize_share_bps: [6000, 3000, 1000],
    is_open_pool: false,
    contributor_count: 0,
    platform_fee_percent: 5,
    net_to_winners: 14250,
    funding_status: "funded",
    ip_terms_type: "retain_all",
    ip_terms_summary: "All entrants retain full ownership of their submitted designs.",
    ip_terms_full: "",
    ip_terms_applies_to_all: true,
    ip_terms_is_default: true,
    ip_terms_warning_level: "none",
    hero_image: heroImageUrl,
    thumbnail_image: heroImageUrl,
    jury: [
      {
        name: "Margaret Calloway",
        title: "Principal",
        organization: "Calloway Architecture, Portland ME",
        bio: "Margaret has practiced in Maine for 25 years with a focus on civic and cultural buildings. Her work includes the Kennebec Valley Cultural Center and the Boothbay Harbor Maritime Museum addition.",
        photo: null,
      },
      {
        name: "Dr. James Whitfield",
        title: "Professor of Architecture",
        organization: "University of Maine School of Architecture",
        bio: "James researches coastal resilience and vernacular building traditions of the North Atlantic. He has advised municipal governments across New England on flood-adaptive design.",
        photo: null,
      },
      {
        name: "Anita Souza",
        title: "Executive Director",
        organization: "Maine Preservation",
        bio: "Anita leads Maine's foremost historic preservation nonprofit. She has overseen review of over 400 National Register nominations and specializes in the integration of contemporary design into historic settings.",
        photo: null,
      },
    ],
    evaluation_criteria: [
      { label: "Contextual sensitivity", weight: 30, description: "Respect for the historic setting and sightlines" },
      { label: "Climate resilience", weight: 25, description: "Flood adaptation, material durability, passive strategies" },
      { label: "Program quality", weight: 25, description: "Clarity and livability of the proposed spaces" },
      { label: "Originality", weight: 20, description: "Innovation in approach without novelty for its own sake" },
    ],
    deliverables: [
      { label: "Site plan", description: "Showing relationship to lighthouse and existing structures, 1:500 min", required: true },
      { label: "Floor plans", description: "All levels at 1:200", required: true },
      { label: "Sections", description: "At least two sections at 1:200", required: true },
      { label: "Elevations", description: "All four facades at 1:200", required: true },
      { label: "Exterior perspective", description: "One rendered view from the public approach", required: true },
      { label: "Interior perspective", description: "One rendered view of the multipurpose hall or exhibition space", required: true },
      { label: "Climate resilience diagram", description: "Annotated drawing explaining flood/wind/passive strategies", required: true },
      { label: "Design statement", description: "500 words maximum", required: true },
    ],
    attachments: [],
    escrow_address: null,
    chain_id: null,
    competition_id_hash: null,
  });

  if (compErr) {
    return NextResponse.json({ error: "Competition insert failed", detail: compErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    slug: COMP_SLUG,
    competitionUrl: `/competitions/${COMP_SLUG}`,
    organizerDashboard: `/organizers/${ORG_SLUG}/dashboard`,
    heroImage: heroImageUrl,
  });
}
