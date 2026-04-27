import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Don't throw at import time — env may not be set in non-Supabase code paths.
  // Functions below will throw on use.
}

let _supabase: SupabaseClient | null = null;

/**
 * Anon-key Supabase client. Safe in both server components and the browser —
 * row-level security gates what each request can see.
 */
export function getSupabase(): SupabaseClient {
  if (!url || !anonKey) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local."
    );
  }
  if (!_supabase) {
    _supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
}
