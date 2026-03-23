import type { Competition, CompetitionStatus, CompetitionType, EligibilityType } from "@/data/types";
import { daysUntil } from "./utils";

export interface FilterState {
  search: string;
  types: CompetitionType[];
  statuses: CompetitionStatus[];
  eligibility: EligibilityType[];
  regions: string[];
  tags: string[];
  prizeMin: number | null;
  prizeMax: number | null;
  deadlineRange: "week" | "month" | "3months" | null;
  openPoolOnly: boolean;
}

export const defaultFilters: FilterState = {
  search: "",
  types: [],
  statuses: [],
  eligibility: [],
  regions: [],
  tags: [],
  prizeMin: null,
  prizeMax: null,
  deadlineRange: null,
  openPoolOnly: false,
};

export type SortOption =
  | "deadline_asc"
  | "deadline_desc"
  | "prize_desc"
  | "newest"
  | "most_funded";

export function filterCompetitions(
  competitions: Competition[],
  filters: FilterState
): Competition[] {
  return competitions.filter((c) => {
    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const searchable = `${c.title} ${c.shortDescription} ${c.organizer.name} ${c.tags.join(" ")} ${c.location}`.toLowerCase();
      if (!searchable.includes(q)) return false;
    }

    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(c.type)) return false;

    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(c.status)) return false;

    // Eligibility filter
    if (filters.eligibility.length > 0 && !filters.eligibility.includes(c.eligibility)) return false;

    // Region filter
    if (filters.regions.length > 0 && !filters.regions.includes(c.region)) return false;

    // Tags filter
    if (filters.tags.length > 0 && !filters.tags.some((t) => c.tags.includes(t))) return false;

    // Prize range
    if (filters.prizeMin !== null && c.prizePool.totalAmount < filters.prizeMin) return false;
    if (filters.prizeMax !== null && c.prizePool.totalAmount > filters.prizeMax) return false;

    // Deadline range
    if (filters.deadlineRange && c.status === "open") {
      const days = daysUntil(c.submissionDeadline);
      if (days < 0) return false;
      if (filters.deadlineRange === "week" && days > 7) return false;
      if (filters.deadlineRange === "month" && days > 30) return false;
      if (filters.deadlineRange === "3months" && days > 90) return false;
    }

    // Open pool only
    if (filters.openPoolOnly && !c.prizePool.isOpenPool) return false;

    return true;
  });
}

export function sortCompetitions(
  competitions: Competition[],
  sort: SortOption
): Competition[] {
  const sorted = [...competitions];
  switch (sort) {
    case "deadline_asc":
      return sorted.sort(
        (a, b) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime()
      );
    case "deadline_desc":
      return sorted.sort(
        (a, b) => new Date(b.submissionDeadline).getTime() - new Date(a.submissionDeadline).getTime()
      );
    case "prize_desc":
      return sorted.sort((a, b) => b.prizePool.totalAmount - a.prizePool.totalAmount);
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case "most_funded":
      return sorted.sort((a, b) => b.prizePool.contributorCount - a.prizePool.contributorCount);
    default:
      return sorted;
  }
}
