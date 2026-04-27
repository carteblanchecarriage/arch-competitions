"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { getProfile } from "@/app/actions/profile";

/**
 * Rendered on every public /submitters/[slug] page.
 * Shows an "Edit profile" link only when the logged-in user owns this profile.
 */
export function EditProfileButton({ slug }: { slug: string }) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;

    getAccessToken().then(async (token) => {
      if (!token) return;
      try {
        const profile = await getProfile(token);
        if (profile?.slug === slug) setIsOwner(true);
      } catch {
        // not a fatal error — just don't show the button
      }
    });
  }, [ready, authenticated, slug, getAccessToken]);

  if (!isOwner) return null;

  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      Edit profile
    </Link>
  );
}
