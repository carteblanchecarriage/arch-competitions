import Link from "next/link";
import type { Competition } from "@/data/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { TYPE_LABELS, ELIGIBILITY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDeadline, isUrgent, cn } from "@/lib/utils";

interface CompetitionCardProps {
  competition: Competition;
  compact?: boolean;
}

export function CompetitionCard({ competition: c, compact }: CompetitionCardProps) {
  const urgent = c.status === "open" && isUrgent(c.submissionDeadline);

  if (compact) {
    return (
      <Link
        href={`/competitions/${c.slug}`}
        className="group flex gap-4 rounded-xl border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
      >
        <div className="relative h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg">
          <img
            src={c.thumbnailImage}
            alt={c.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-gray-700">
              {c.title}
            </h3>
            <p className="text-xs text-gray-500">{c.organizer.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(c.prizePool.totalAmount)}
            </span>
            {c.status === "open" && (
              <span className={cn("text-xs font-medium", urgent ? "text-red-600" : "text-gray-500")}>
                {formatDeadline(c.submissionDeadline)}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/competitions/${c.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={c.thumbnailImage}
          alt={c.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={c.status} />
        </div>
        {c.prizePool.isOpenPool && (
          <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur">
            Open Pool
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Tags row */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Tag variant="type">{TYPE_LABELS[c.type]}</Tag>
          <Tag variant="eligibility">{ELIGIBILITY_LABELS[c.eligibility]}</Tag>
          {c.ipTerms.warningLevel === "caution" && (
            <Tag className="bg-amber-50 text-amber-700">IP: Review Terms</Tag>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700">
          {c.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
          {c.shortDescription}
        </p>

        {/* Meta */}
        <div className="mt-auto pt-4">
          {/* Prize */}
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold tracking-tight text-gray-900">
              {formatCurrency(c.prizePool.totalAmount)}
            </span>
            {c.prizePool.isOpenPool && (
              <span className="text-xs text-gray-500">
                {c.prizePool.contributorCount} contributors
              </span>
            )}
          </div>

          {/* Deadline & location */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {c.location}
            </span>
            {c.status === "open" && (
              <span className={cn("font-medium", urgent ? "text-red-600" : "text-gray-600")}>
                {formatDeadline(c.submissionDeadline)}
              </span>
            )}
          </div>

          {/* Organizer */}
          <div className="mt-2 flex items-center gap-1.5 border-t border-gray-100 pt-2">
            <span className="text-xs text-gray-500">{c.organizer.name}</span>
            {c.organizer.isVerified && (
              <svg className="h-3.5 w-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
