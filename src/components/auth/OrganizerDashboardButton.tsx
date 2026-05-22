"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { getMyOrganizer } from "@/app/actions/organizer";

/**
 * Rendered on every public /organizers/[slug] page.
 * Shows a "Dashboard" link only when the logged-in user owns this organizer account.
 */
export function OrganizerDashboardButton({ slug }: { slug: string }) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (!ready || !authenticated) return;

    getAccessToken().then(async (token) => {
      if (!token) return;
      try {
        const org = await getMyOrganizer(token);
        if (org?.slug === slug) setIsOwner(true);
      } catch {
        // not a fatal error — just don't show the button
      }
    });
  }, [ready, authenticated, slug, getAccessToken]);

  if (!isOwner) return null;

  return (
    <Link
      href={`/organizers/${slug}/dashboard`}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:border-gray-400 hover:text-gray-900"
    >
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Submissions
    </Link>
  );
}
