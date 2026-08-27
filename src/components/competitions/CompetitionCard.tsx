import Link from "next/link";
import type { Competition } from "@/data/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tag } from "@/components/ui/Tag";
import { TYPE_LABELS, ELIGIBILITY_LABELS } from "@/lib/constants";
import { formatCurrency, formatDeadline, daysUntil, isUrgent, cn } from "@/lib/utils";

const DEMO_COMPETITION_SLUG = "riverside-crossing-pavilion";

interface CompetitionCardProps {
  competition: Competition;
  compact?: boolean;
}

export function CompetitionCard({ competition: c, compact }: CompetitionCardProps) {
  const urgent = c.status === "open" && isUrgent(c.submissionDeadline);
  const isDemo = c.slug === DEMO_COMPETITION_SLUG;

  if (compact) {
    return (
      <Link
        href={`/competitions/${c.slug}`}
        className="group flex gap-4 bg-white p-3 transition-opacity hover:opacity-80"
      >
        <div className="relative h-20 w-28 shrink-0 overflow-hidden">
          <img
            src={c.thumbnailImage || c.heroImage}
            alt={c.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isDemo && (
            <div className="absolute inset-x-0 top-0 bg-black py-0.5 text-center font-mono text-[0.5rem] font-bold uppercase tracking-widest text-white">
              Demo
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="truncate text-sm font-semibold text-[#111] group-hover:text-gray-600">
              {c.title}
            </h3>
            <p className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">{c.organizer.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-[#111]">
              {formatCurrency(c.prizePool.totalAmount)}
            </span>
            {c.status === "open" && (
              <span className={cn("font-mono text-[0.625rem] uppercase tracking-widest", urgent ? "text-red-600" : "text-gray-400")}>
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
      className="group flex flex-col overflow-hidden bg-white transition-opacity hover:opacity-80"
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden">
        <img
          src={c.thumbnailImage || c.heroImage}
          alt={c.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isDemo && (
          <div className="absolute inset-x-0 top-0 bg-black py-1 text-center font-mono text-[0.625rem] font-bold uppercase tracking-widest text-white">
            Demo — Not a Real Competition
          </div>
        )}
        <div className={cn("absolute left-3", isDemo ? "top-9" : "top-3")}>
          <StatusBadge status={c.status} />
        </div>
        {c.prizePool.isOpenPool && (
          <div className={cn("absolute right-3  bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 backdrop-blur", isDemo ? "top-9" : "top-3")}>
            Open Pool
          </div>
        )}
        {c.status === "open" && (() => {
          const days = daysUntil(c.submissionDeadline);
          if (days < 0 || days > 14) return null;
          return (
            <div className="absolute bottom-3 left-3">
              <span className={cn(
                " px-2.5 py-1 text-xs font-semibold",
                days <= 7
                  ? "bg-red-600 text-white"
                  : "bg-white/90 text-gray-900 backdrop-blur"
              )}>
                {formatDeadline(c.submissionDeadline)}
              </span>
            </div>
          );
        })()}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Tags row */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          <Tag variant="type">{TYPE_LABELS[c.type]}</Tag>
          <Tag variant="eligibility">{ELIGIBILITY_LABELS[c.eligibility]}</Tag>
          {c.ipTerms.warningLevel === "caution" && (
            <Tag className="bg-amber-50 text-amber-700">IP: Review</Tag>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-snug text-[#111]">
          {c.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {c.shortDescription}
        </p>

        {/* Meta */}
        <div className="mt-auto pt-5">
          {/* Organizer */}
          <div className="mb-3 flex items-center gap-1.5">
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">
              {c.organizer.name}
            </span>
            {c.organizer.isVerified && (
              <span className="font-mono text-[0.625rem] text-emerald-600">✓</span>
            )}
          </div>

          {/* Prize + deadline */}
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-lg font-semibold tracking-tight text-[#111]">
              {formatCurrency(c.prizePool.totalAmount)}
            </span>
            {c.status === "open" && (
              <span className={cn("font-mono text-[0.625rem] uppercase tracking-widest", urgent ? "text-red-600" : "text-gray-400")}>
                {formatDeadline(c.submissionDeadline)}
              </span>
            )}
          </div>

          {/* Location + contributors */}
          <div className="mt-1.5 flex items-center justify-between">
            <span className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">
              {c.location}
            </span>
            {c.prizePool.isOpenPool && (
              <span className="font-mono text-[0.625rem] uppercase tracking-widest text-gray-400">
                {c.prizePool.contributorCount} contributors
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
