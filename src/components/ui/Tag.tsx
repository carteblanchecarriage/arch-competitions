import { cn } from "@/lib/utils";

interface TagProps {
  children: React.ReactNode;
  variant?: "default" | "status" | "type" | "eligibility";
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Tag({
  children,
  variant = "default",
  color,
  bgColor,
  className,
}: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-widest",
        variant === "default" && "bg-gray-100 text-gray-600",
        variant === "type" && "bg-gray-100 text-gray-600",
        variant === "eligibility" && "bg-gray-100 text-gray-600",
        color && bgColor && `${color} ${bgColor}`,
        className
      )}
    >
      {children}
    </span>
  );
}
