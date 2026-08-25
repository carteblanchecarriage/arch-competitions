"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Register the current user for a competition. Idempotent. */
export async function registerForCompetition(
  accessToken: string,
  competitionId: string
): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!sub) throw new Error("You need a profile before you can register.");

  const { data: comp } = await db
    .from("competitions")
    .select("status")
    .eq("id", competitionId)
    .maybeSingle();

  if (!comp) throw new Error("Competition not found.");
  if (comp.status !== "open") throw new Error("This competition is no longer accepting registrations.");

  const { error } = await db
    .from("competition_registrations")
    .upsert(
      { competition_id: competitionId, submitter_id: sub.id },
      { onConflict: "competition_id,submitter_id" }
    );

  if (error) throw new Error(error.message);
}

/** Returns true if the current user is registered for the competition. */
export async function getMyRegistration(
  accessToken: string,
  competitionId: string
): Promise<boolean> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: sub } = await db
    .from("submitters")
    .select("id")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!sub) return false;

  const { data } = await db
    .from("competition_registrations")
    .select("id")
    .eq("competition_id", competitionId)
    .eq("submitter_id", sub.id)
    .maybeSingle();

  return !!data;
}
