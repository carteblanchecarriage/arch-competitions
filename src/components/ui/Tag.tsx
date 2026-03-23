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
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "default" && "bg-gray-100 text-gray-700",
        variant === "type" && "bg-blue-50 text-blue-700",
        variant === "eligibility" && "bg-purple-50 text-purple-700",
        color && bgColor && `${color} ${bgColor}`,
        className
      )}
    >
      {children}
    </span>
  );
}
