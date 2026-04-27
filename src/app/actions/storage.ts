"use server";

import { createClient } from "@supabase/supabase-js";
import { getPrivyServer } from "@/lib/privy/server";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function getSignedUploadUrl(
  accessToken: string,
  bucket: string,
  path: string
): Promise<string> {
  const privy = getPrivyServer();
  await privy.verifyAuthToken(accessToken);

  const { data, error } = await supabaseAdmin()
    .storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) throw new Error(`Storage signed URL: ${error?.message}`);
  return data.signedUrl;
}
