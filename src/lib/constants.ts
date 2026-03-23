import type { CompetitionStatus, CompetitionType, EligibilityType } from "@/data/types";

export const STATUS_CONFIG: Record<
  CompetitionStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  open: {
    label: "Open for Submissions",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    dotColor: "bg-emerald-500",
  },
  judging: {
    label: "In Judging",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    dotColor: "bg-amber-500",
  },
  announced: {
    label: "Winners Announced",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    dotColor: "bg-blue-500",
  },
};

export const TYPE_LABELS: Record<CompetitionType, string> = {
  open: "Open",
  student: "Student",
  ideas: "Ideas",
  invite_only: "Invite Only",
  awards: "Awards",
};

export const ELIGIBILITY_LABELS: Record<EligibilityType, string> = {
  open_to_all: "Open to All",
  students_only: "Students Only",
  licensed_professionals: "Licensed Professionals",
  regional: "Regional",
};

export const REGIONS = [
  "Global",
  "North America",
  "Europe",
  "Asia",
  "Middle East",
  "Africa",
  "South America",
  "Oceania",
] as const;

export const TAGS = [
  "housing",
  "public-space",
  "cultural",
  "sustainability",
  "residential",
  "education",
  "civic",
  "memorial",
  "infrastructure",
  "adaptive-reuse",
  "landscape",
  "urban-design",
  "pavilion",
  "mixed-use",
  "healthcare",
] as const;

export const PLATFORM_FEE_PERCENT = 5;
