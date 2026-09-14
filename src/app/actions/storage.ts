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

// Every upload path must look like "<uuid-session-id>/<safe-filename>" — this
// is what stops path traversal and cross-user collisions, since the session
// id segment can't be guessed or chosen to match someone else's.
const UUID = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";
const SAFE_FILENAME = "[a-zA-Z0-9._-]+";
const PATH_RE = new RegExp(`^${UUID}/${SAFE_FILENAME}$`);

// Extensions allowed per bucket. Deliberately excludes .svg — an uploaded SVG
// opened directly (not via <img>) can execute embedded <script>, which would
// be a stored-XSS vector served from our own storage domain.
const BUCKET_EXTENSIONS: Record<string, string[]> = {
  "competition-images": ["png", "jpg", "jpeg", "webp"],
  "competition-files": ["pdf", "dwg", "dxf", "3dm", "skp", "rvt", "ifc", "zip", "png", "jpg", "jpeg", "xlsx", "docx"],
  "entry-files": ["pdf", "dwg", "dxf", "3dm", "skp", "rvt", "ifc", "zip", "png", "jpg", "jpeg", "xlsx", "docx"],
};

export async function getSignedUploadUrl(
  accessToken: string,
  bucket: string,
  path: string
): Promise<string> {
  await getPrivyServer().verifyAuthToken(accessToken);

  const allowedExtensions = BUCKET_EXTENSIONS[bucket];
  if (!allowedExtensions) throw new Error("Invalid upload destination.");

  if (!PATH_RE.test(path)) throw new Error("Invalid upload path.");

  const ext = path.split(".").pop()?.toLowerCase();
  if (!ext || !allowedExtensions.includes(ext)) {
    throw new Error(`File type .${ext ?? ""} isn't allowed for this upload.`);
  }

  const { data, error } = await supabaseAdmin()
    .storage
    .from(bucket)
    .createSignedUploadUrl(path, { upsert: true });

  if (error || !data) throw new Error(`Storage signed URL: ${error?.message}`);
  return data.signedUrl;
}
