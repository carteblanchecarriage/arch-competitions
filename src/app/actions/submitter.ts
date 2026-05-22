"use server";

import { createClient } from "@supabase/supabase-js";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export interface SubmitterSearchResult {
  slug: string;
  name: string;
  photo: string | null;
  bio: string;
  city: string | null;
  country: string;
}

export async function searchSubmitters(query: string): Promise<SubmitterSearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabaseAdmin()
    .from("submitters")
    .select("slug, name, photo, bio, city, country")
    .ilike("name", `%${q}%`)
    .limit(8);
  if (error) return [];
  return data as SubmitterSearchResult[];
}
