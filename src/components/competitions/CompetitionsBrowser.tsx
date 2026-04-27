"use client";

import { useState } from "react";
import { CompetitionGrid } from "@/components/competitions/CompetitionGrid";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SearchBar } from "@/components/filters/SearchBar";
import { SortDropdown } from "@/components/filters/SortDropdown";
import {
  filterCompetitions,
  sortCompetitions,
  defaultFilters,
  type FilterState,
  type SortOption,
} from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { Competition } from "@/data/types";

interface CompetitionsBrowserProps {
  competitions: Competition[];
}

export function CompetitionsBrowser({ competitions }: CompetitionsBrowserProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("deadline_asc");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = sortCompetitions(filterCompetitions(competitions, filters), sort);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Competitions
        </h1>
        <p className="mt-1 text-gray-500">
          Browse architecture and design competitions worldwide. Always free to enter.
        </p>
      </div>

      {/* Search + Sort bar */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 sm:max-w-md">
          <SearchBar
            value={filters.search}
            onChange={(search) => setFilters({ ...filters, search })}
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors lg:hidden",
              showFilters
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        <aside
          className={cn(
            "w-72 flex-shrink-0",
            showFilters ? "block" : "hidden lg:block"
          )}
        >
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            competitionCount={filtered.length}
          />
        </aside>

        <div className="min-w-0 flex-1">
          <CompetitionGrid
            competitions={filtered}
            emptyMessage="No competitions match your filters"
          />
        </div>
      </div>
    </div>
  );
}
