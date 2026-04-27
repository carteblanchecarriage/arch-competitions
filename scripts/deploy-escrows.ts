/**
 * Deploy a CompetitionEscrow clone for every open-pool competition that
 * doesn't yet have one. Updates escrow_address, chain_id, competition_id_hash,
 * and prize_share_bps in Supabase after each successful deploy.
 *
 * Usage:
 *   1. Add to .env.local (temporarily):
 *        DEPLOYER_PRIVATE_KEY=0x...        (the wallet that owns the factory)
 *        SUPABASE_SERVICE_ROLE_KEY=eyJ...  (bypasses RLS for writes)
 *   2. npm run deploy:escrows
 *   3. Remove SUPABASE_SERVICE_ROLE_KEY from .env.local when done.
 *
 * The deployer wallet becomes the on-chain `organizer` for each escrow
 * (can lock, announce winners, cancel). Gas cost per clone ≈ $0.001 on Base.
 */

import { createWalletClient, createPublicClient, http, keccak256, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { competitionEscrowFactoryAbi } from "../src/lib/contracts/generated";

config({ path: ".env.local" });

// ── env checks ──────────────────────────────────────────────────────────────

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL;

if (!DEPLOYER_KEY || !SUPABASE_URL || !SERVICE_KEY || !FACTORY_ADDRESS || !RPC_URL) {
  console.error(
    "Missing env vars. Need: DEPLOYER_PRIVATE_KEY, NEXT_PUBLIC_SUPABASE_URL, " +
    "SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_FACTORY_ADDRESS_BASE_SEPOLIA, " +
    "NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL"
  );
  process.exit(1);
}

// ── constants ────────────────────────────────────────────────────────────────

const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as const;
const CHAIN_ID = baseSepolia.id; // 84532

// ── clients ──────────────────────────────────────────────────────────────────

const account = privateKeyToAccount(DEPLOYER_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http(RPC_URL),
});

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive prizeShareBps (uint16[], sums to 10_000) from the prize breakdown
 * stored in the DB. Each entry's amount is the net-to-winner dollar figure;
 * we convert to proportional basis points.
 */
function computePrizeShareBps(breakdown: Array<{ amount: number }>): number[] {
  if (!breakdown || breakdown.length === 0) return [10000];
  if (breakdown.length === 1) return [10000];

  const total = breakdown.reduce((sum, b) => sum + Number(b.amount), 0);
  if (total === 0) return [10000];

  const bps = breakdown.map((b) => Math.floor((Number(b.amount) / total) * 10000));
  // Last tier absorbs rounding dust so sum is exactly 10_000
  const sum = bps.reduce((a, b) => a + b, 0);
  bps[bps.length - 1] += 10000 - sum;

  return bps;
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Deployer: ${account.address}`);
  console.log(`Factory:  ${FACTORY_ADDRESS}`);
  console.log(`Chain:    Base Sepolia (${CHAIN_ID})\n`);

  // Fetch open-pool competitions without an escrow
  const { data, error } = await supabase
    .from("competitions")
    .select("id, slug, prize_breakdown, submission_deadline")
    .eq("is_open_pool", true)
    .is("escrow_address", null);

  if (error) throw new Error(`Supabase fetch: ${error.message}`);
  if (!data || data.length === 0) {
    console.log("No open-pool competitions need escrows. Done.");
    return;
  }

  console.log(`Found ${data.length} competition(s) needing escrows.\n`);

  const nowSec = Math.floor(Date.now() / 1000);

  for (const comp of data) {
    console.log(`── ${comp.slug}`);

    // bytes32 identifier — deterministic from slug
    const competitionId = keccak256(toHex(comp.slug)) as `0x${string}`;

    const prizeShareBps = computePrizeShareBps(comp.prize_breakdown ?? []);
    console.log(`   prizeShareBps: [${prizeShareBps.join(", ")}]`);

    // Factory requires submissionDeadline > block.timestamp.
    // If the stored deadline is in the past (mock data), use tomorrow.
    const storedDeadlineSec = Math.floor(
      new Date(comp.submission_deadline).getTime() / 1000
    );
    const submissionDeadline = BigInt(
      storedDeadlineSec > nowSec + 3600 ? storedDeadlineSec : nowSec + 86400
    );
    const expirationTimestamp = submissionDeadline + BigInt(365 * 24 * 3600);

    // Predict address before sending the tx (view call, free)
    const escrowAddress = await publicClient.readContract({
      abi: competitionEscrowFactoryAbi,
      address: FACTORY_ADDRESS,
      functionName: "predictEscrow",
      args: [account.address, competitionId],
    });
    console.log(`   predicted:     ${escrowAddress}`);

    // Deploy the clone
    const hash = await walletClient.writeContract({
      abi: competitionEscrowFactoryAbi,
      address: FACTORY_ADDRESS,
      functionName: "createEscrow",
      args: [competitionId, USDC_BASE_SEPOLIA, prizeShareBps, submissionDeadline, expirationTimestamp],
    });
    console.log(`   tx:            ${hash}`);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log(`   confirmed:     block ${receipt.blockNumber}`);

    // Write back to Supabase
    const { error: updateErr } = await supabase
      .from("competitions")
      .update({
        escrow_address: escrowAddress,
        chain_id: CHAIN_ID,
        competition_id_hash: competitionId,
        prize_share_bps: prizeShareBps,
      })
      .eq("id", comp.id);

    if (updateErr) throw new Error(`DB update for ${comp.slug}: ${updateErr.message}`);
    console.log(`   ✓ stored in DB\n`);
  }

  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
