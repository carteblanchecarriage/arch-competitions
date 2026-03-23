import type { Competition } from "@/data/types";
import { CompetitionCard } from "./CompetitionCard";

interface CompetitionGridProps {
  competitions: Competition[];
  emptyMessage?: string;
}

export function CompetitionGrid({ competitions, emptyMessage }: CompetitionGridProps) {
  if (competitions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
        <svg className="mb-3 h-10 w-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-sm text-gray-500">{emptyMessage || "No competitions found"}</p>
        <p className="mt-1 text-xs text-gray-400">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {competitions.map((c) => (
        <CompetitionCard key={c.id} competition={c} />
      ))}
    </div>
  );
}
