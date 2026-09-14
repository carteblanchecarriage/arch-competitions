import { getPrivyServer } from "@/lib/privy/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Verifies the caller's Privy session and checks their email against the
 * ADMIN_EMAILS allowlist. Throws if either check fails.
 */
export async function requireAdmin(accessToken: string): Promise<{ userId: string; email: string }> {
  const allowed = adminEmails();
  if (allowed.length === 0) throw new Error("Admin access is not configured.");

  const { userId } = await getPrivyServer().verifyAuthToken(accessToken);
  const user = await getPrivyServer().getUser(userId);
  const email = user.email?.address?.toLowerCase();

  if (!email || !allowed.includes(email)) {
    throw new Error("Not authorized.");
  }

  return { userId, email };
}
