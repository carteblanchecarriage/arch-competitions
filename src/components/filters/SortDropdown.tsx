"use client";

import type { SortOption } from "@/lib/filters";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "deadline_asc", label: "Deadline (soonest)" },
  { value: "prize_desc", label: "Prize (highest)" },
  { value: "newest", label: "Newest" },
  { value: "most_funded", label: "Most contributors" },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500">Sort by</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
