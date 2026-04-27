"use server";

import { createClient } from "@supabase/supabase-js";
import { createWalletClient, createPublicClient, http, keccak256, toHex } from "viem";
import type { CompetitionAttachment } from "@/data/types";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { getPrivyServer } from "@/lib/privy/server";
import { competitionEscrowFactoryAbi } from "@/lib/contracts/generated";

const PLATFORM_FEE_PERCENT = 5;

const USDC_ADDRESS: Record<number, `0x${string}`> = {
  [base.id]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [baseSepolia.id]: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
};

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "competition";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export interface TierInput {
  place: string;
  percent: number; // share of winner pool (sums to 100)
}

export interface CreateCompetitionInput {
  title: string;
  type: string;
  shortDescription: string;
  location: string;
  heroImageUrl: string;
  brief: string;
  designObjectives: string[];
  siteContext: string;
  registrationDeadline: string;
  submissionDeadline: string;
  isOpenPool: boolean;
  totalAmount: number;
  tiers: TierInput[];
  ipTermsType: string;
  attachments: CompetitionAttachment[];
}

export async function createCompetition(
  accessToken: string,
  input: CreateCompetitionInput
): Promise<{ slug: string }> {
  const privy = getPrivyServer();
  const { userId } = await privy.verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  // ── 1. Get or create organizer ────────────────────────────────────────
  let { data: organizer } = await db
    .from("organizers")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!organizer) {
    // Fall back to their submitter name if they have a profile
    const { data: submitter } = await db
      .from("submitters")
      .select("name")
      .eq("privy_user_id", userId)
      .maybeSingle();

    const orgName = submitter?.name || "Independent Organizer";
    const orgSlug = slugify(orgName);

    const { data: newOrg, error: orgErr } = await db
      .from("organizers")
      .insert({
        slug: orgSlug,
        privy_user_id: userId,
        name: orgName,
        description: "",
        is_verified: false,
        competitions_count: 0,
        payout_completion_rate: 100,
      })
      .select("id")
      .single();

    if (orgErr) throw new Error(`Create organizer: ${orgErr.message}`);
    organizer = newOrg;
  }

  // ── 2. Derive prize structure ─────────────────────────────────────────
  // tiers are % of winner share (sum to 100). Convert to basis points.
  const prizeShareBps = input.tiers.map((t) => Math.round(t.percent * 100));
  const bpsSum = prizeShareBps.reduce((a, b) => a + b, 0);
  if (bpsSum !== 10000) {
    // Absorb rounding dust into last tier
    prizeShareBps[prizeShareBps.length - 1] += 10000 - bpsSum;
  }

  const netToWinners = input.totalAmount * (1 - PLATFORM_FEE_PERCENT / 100);
  const breakdown = input.tiers.map((t) => ({
    place: t.place,
    amount: input.isOpenPool ? 0 : Math.round(netToWinners * (t.percent / 100) * 100) / 100,
  }));

  // ── 3. Deploy escrow ──────────────────────────────────────────────────
  const isProd = process.env.NODE_ENV === "production";
  const chain = isProd ? base : baseSepolia;
  const factoryAddress = (isProd
    ? process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE
    : process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA) as `0x${string}` | undefined;
  const deployerKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined;

  let escrowAddress: string | null = null;
  let competitionIdHash: string | null = null;

  if (factoryAddress && deployerKey) {
    const slug = slugify(input.title); // will be overwritten below, but used for salt
    const competitionId = keccak256(toHex(slug));
    competitionIdHash = competitionId;

    const account = privateKeyToAccount(deployerKey);
    const publicClient = createPublicClient({ chain, transport: http() });
    const walletClient = createWalletClient({ account, chain, transport: http() });

    const nowSec = Math.floor(Date.now() / 1000);
    const deadlineSec = Math.floor(new Date(input.submissionDeadline).getTime() / 1000);
    const submissionDeadline = BigInt(deadlineSec > nowSec + 3600 ? deadlineSec : nowSec + 86400);
    const expirationTimestamp = submissionDeadline + BigInt(365 * 24 * 3600);

    const predicted = await publicClient.readContract({
      abi: competitionEscrowFactoryAbi,
      address: factoryAddress,
      functionName: "predictEscrow",
      args: [account.address, competitionId],
    });

    const hash = await walletClient.writeContract({
      abi: competitionEscrowFactoryAbi,
      address: factoryAddress,
      functionName: "createEscrow",
      args: [competitionId, USDC_ADDRESS[chain.id], prizeShareBps, submissionDeadline, expirationTimestamp],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    escrowAddress = predicted;
  }

  // ── 4. Insert competition ─────────────────────────────────────────────
  const slug = slugify(input.title);
  const { error: compErr } = await db.from("competitions").insert({
    slug,
    organizer_id: organizer!.id,
    title: input.title,
    type: input.type,
    short_description: input.shortDescription,
    brief: input.brief,
    design_objectives: input.designObjectives.filter(Boolean),
    site_context: input.siteContext || null,
    location: input.location || null,
    language: "en",
    status: "open",
    eligibility: "open_to_all",
    tags: [],
    registration_deadline: input.registrationDeadline || null,
    submission_deadline: input.submissionDeadline,
    prize_total_amount: input.totalAmount,
    prize_currency: "USD",
    prize_breakdown: breakdown,
    prize_share_bps: prizeShareBps,
    is_open_pool: input.isOpenPool,
    contributor_count: 0,
    platform_fee_percent: PLATFORM_FEE_PERCENT,
    net_to_winners: netToWinners,
    funding_status: input.isOpenPool ? "partially_funded" : "unfunded",
    ip_terms_type: input.ipTermsType,
    ip_terms_summary: "",
    ip_terms_full: "",
    ip_terms_applies_to_all: false,
    ip_terms_is_default: input.ipTermsType === "retain_all",
    ip_terms_warning_level: input.ipTermsType === "winning_transfer" ? "caution"
      : input.ipTermsType === "retain_all" ? "none" : "info",
    hero_image: input.heroImageUrl || null,
    jury: [],
    evaluation_criteria: [],
    deliverables: [],
    attachments: input.attachments ?? [],
    escrow_address: escrowAddress,
    chain_id: escrowAddress ? chain.id : null,
    competition_id_hash: competitionIdHash,
  });

  if (compErr) throw new Error(`Create competition: ${compErr.message}`);

  // Increment organizer competition count
  await db.rpc("increment_competitions_count", { org_id: organizer!.id }).maybeSingle();

  return { slug };
}
