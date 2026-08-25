"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { getProfile } from "@/app/actions/profile";

/**
 * Shown on public /submitters/[slug] pages when the viewer owns the profile.
 * Takes them to their private profile page, not directly into edit mode.
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
        // not a fatal error
      }
    });
  }, [ready, authenticated, slug, getAccessToken]);

  if (!isOwner) return null;

  return (
    <Link
      href="/account"
      className="inline-flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
      My profile
    </Link>
  );
}
