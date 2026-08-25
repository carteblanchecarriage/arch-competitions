import type { CompetitionStatus } from "@/data/types";
import { STATUS_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: CompetitionStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest",
        config.bgColor,
        config.color,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 ", config.dotColor)} />
      {config.label}
    </span>
  );
}
