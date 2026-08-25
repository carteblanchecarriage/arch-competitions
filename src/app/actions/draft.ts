"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";
import type { CompetitionAttachment } from "@/data/types";
import type { TierInput, JuryInput } from "./competition";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export interface DraftFormData {
  title: string;
  type: string;
  shortDescription: string;
  location: string;
  heroImageUrl: string;
  uploadSessionId: string;
  brief: string;
  designObjectives: string[];
  siteContext: string;
  attachments: CompetitionAttachment[];
  isOpenPool: boolean;
  totalAmount: string;
  tiers: TierInput[];
  registrationDeadline: string;
  submissionDeadline: string;
  jury: JuryInput[];
  juryConflictDeclared: boolean;
  ipTermsType: string;
  professionalFeesAcknowledged: boolean;
}

export interface SavedDraft {
  id: string;
  data: DraftFormData;
  updatedAt: string;
}

/** Upsert the user's single in-progress draft. */
export async function saveDraft(
  accessToken: string,
  data: DraftFormData
): Promise<{ id: string }> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const db = supabaseAdmin();

  const { data: row, error } = await db
    .from("competition_drafts")
    .upsert(
      { privy_user_id: userId, data, updated_at: new Date().toISOString() },
      { onConflict: "privy_user_id" }
    )
    .select("id")
    .single();

  if (error || !row) throw new Error(error?.message ?? "Failed to save draft");
  return { id: row.id };
}

/** Return the user's current draft, or null if they have none. */
export async function getMyDraft(accessToken: string): Promise<SavedDraft | null> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const { data } = await supabaseAdmin()
    .from("competition_drafts")
    .select("id, data, updated_at")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (!data) return null;
  return {
    id: data.id,
    data: data.data as DraftFormData,
    updatedAt: data.updated_at,
  };
}

/** Delete the user's draft (call after publishing or discarding). */
export async function discardDraft(accessToken: string): Promise<void> {
  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  await supabaseAdmin()
    .from("competition_drafts")
    .delete()
    .eq("privy_user_id", userId);
}
