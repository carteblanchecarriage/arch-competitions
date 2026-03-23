"use client";

import type { FilterState } from "@/lib/filters";
import type { CompetitionStatus, CompetitionType, EligibilityType } from "@/data/types";
import { STATUS_CONFIG, TYPE_LABELS, ELIGIBILITY_LABELS, REGIONS, TAGS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  competitionCount: number;
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-200 py-4 last:border-0">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</h3>
      {children}
    </div>
  );
}

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
  labels,
}: {
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  labels: Record<T, string>;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => (
        <label key={opt} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-50">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => {
              onChange(
                selected.includes(opt)
                  ? selected.filter((s) => s !== opt)
                  : [...selected, opt]
              );
            }}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
          />
          <span className="text-gray-700">{labels[opt]}</span>
        </label>
      ))}
    </div>
  );
}

export function FilterSidebar({ filters, onChange, competitionCount }: FilterSidebarProps) {
  const activeCount = [
    filters.types.length,
    filters.statuses.length,
    filters.eligibility.length,
    filters.regions.length,
    filters.tags.length,
    filters.prizeMin !== null ? 1 : 0,
    filters.deadlineRange ? 1 : 0,
    filters.openPoolOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Filters
          {activeCount > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-xs text-white">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button
            onClick={() =>
              onChange({
                search: filters.search,
                types: [],
                statuses: [],
                eligibility: [],
                regions: [],
                tags: [],
                prizeMin: null,
                prizeMax: null,
                deadlineRange: null,
                openPoolOnly: false,
              })
            }
            className="text-xs text-gray-500 hover:text-gray-900"
          >
            Clear all
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-gray-500">{competitionCount} competitions</p>

      <FilterSection title="Type">
        <CheckboxGroup
          options={Object.keys(TYPE_LABELS) as CompetitionType[]}
          selected={filters.types}
          onChange={(types) => onChange({ ...filters, types })}
          labels={TYPE_LABELS}
        />
      </FilterSection>

      <FilterSection title="Status">
        <CheckboxGroup
          options={Object.keys(STATUS_CONFIG) as CompetitionStatus[]}
          selected={filters.statuses}
          onChange={(statuses) => onChange({ ...filters, statuses })}
          labels={Object.fromEntries(
            Object.entries(STATUS_CONFIG).map(([k, v]) => [k, v.label])
          ) as Record<CompetitionStatus, string>}
        />
      </FilterSection>

      <FilterSection title="Eligibility">
        <CheckboxGroup
          options={Object.keys(ELIGIBILITY_LABELS) as EligibilityType[]}
          selected={filters.eligibility}
          onChange={(eligibility) => onChange({ ...filters, eligibility })}
          labels={ELIGIBILITY_LABELS}
        />
      </FilterSection>

      <FilterSection title="Deadline">
        <div className="space-y-1.5">
          {([
            ["week", "This week"],
            ["month", "This month"],
            ["3months", "Next 3 months"],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-gray-50">
              <input
                type="radio"
                name="deadline"
                checked={filters.deadlineRange === value}
                onChange={() => onChange({ ...filters, deadlineRange: filters.deadlineRange === value ? null : value })}
                className="border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              <span className="text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Prize Range">
        <div className="flex gap-2">
          {([
            [null, "Any"],
            [1000, "$1k+"],
            [10000, "$10k+"],
            [25000, "$25k+"],
          ] as const).map(([value, label]) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, prizeMin: filters.prizeMin === value ? null : value })}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                filters.prizeMin === value
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Region">
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() =>
                onChange({
                  ...filters,
                  regions: filters.regions.includes(region)
                    ? filters.regions.filter((r) => r !== region)
                    : [...filters.regions, region],
                })
              }
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filters.regions.includes(region)
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {region}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Tags">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                onChange({
                  ...filters,
                  tags: filters.tags.includes(tag)
                    ? filters.tags.filter((t) => t !== tag)
                    : [...filters.tags, tag],
                })
              }
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                filters.tags.includes(tag)
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </FilterSection>

      <div className="pt-4">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={filters.openPoolOnly}
            onChange={() => onChange({ ...filters, openPoolOnly: !filters.openPoolOnly })}
            className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
          />
          <span className="font-medium text-gray-700">Open prize pools only</span>
        </label>
      </div>
    </div>
  );
}
