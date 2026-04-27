"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars not set");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "designer";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export interface ProfileInput {
  name: string;
  type: "individual" | "studio";
  country: string;
  city?: string;
  bio: string;
  specialties: string[];
  website?: string;
  yearEstablished?: number;
}

/** Returns the submitter row for the logged-in user, or null if none exists. */
export async function getProfile(accessToken: string) {
  const privy = getPrivyServer();
  const { userId } = await privy.verifyAuthToken(accessToken);

  const { data, error } = await supabaseAdmin()
    .from("submitters")
    .select("*")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (error) throw new Error(`getProfile: ${error.message}`);
  return data as SubmitterRow | null;
}

/** Create or update the submitter profile for the logged-in user. */
export async function saveProfile(accessToken: string, input: ProfileInput) {
  const privy = getPrivyServer();
  const { userId } = await privy.verifyAuthToken(accessToken);

  const db = supabaseAdmin();

  // Check if a row already exists for this user
  const { data: existing } = await db
    .from("submitters")
    .select("id, slug")
    .eq("privy_user_id", userId)
    .maybeSingle();

  if (existing) {
    // Update — slug stays fixed so URLs don't break
    const { error } = await db
      .from("submitters")
      .update({
        name: input.name,
        type: input.type,
        country: input.country,
        city: input.city ?? null,
        bio: input.bio,
        specialties: input.specialties,
        website: input.website ?? null,
        year_established: input.yearEstablished ?? null,
      })
      .eq("privy_user_id", userId);

    if (error) throw new Error(`saveProfile update: ${error.message}`);
    return { slug: existing.slug as string };
  }

  // Create — generate a URL-safe slug from their name
  const slug = generateSlug(input.name || "designer");
  const { error } = await db.from("submitters").insert({
    slug,
    privy_user_id: userId,
    name: input.name,
    type: input.type,
    country: input.country,
    city: input.city ?? null,
    bio: input.bio,
    specialties: input.specialties,
    website: input.website ?? null,
    year_established: input.yearEstablished ?? null,
  });

  if (error) throw new Error(`saveProfile insert: ${error.message}`);
  return { slug };
}

// ── internal type matching the Supabase row shape ───────────────────────────

interface SubmitterRow {
  id: string;
  slug: string;
  privy_user_id: string | null;
  wallet_address: string | null;
  name: string;
  type: "individual" | "studio";
  photo: string | null;
  country: string;
  city: string | null;
  bio: string;
  specialties: string[];
  website: string | null;
  year_established: number | null;
}
