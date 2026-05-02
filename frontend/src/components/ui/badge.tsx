"use client";

import { cn } from "@/lib/utils/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        variant === "default" && "bg-white/[0.08] text-text-secondary",
        variant === "success" && "bg-accent-emerald/10 text-accent-emerald",
        variant === "warning" && "bg-accent-amber/10 text-accent-amber",
        variant === "danger" && "bg-accent-rose/10 text-accent-rose",
        variant === "info" && "bg-accent-blue/10 text-accent-blue",
        className
      )}
    >
      {children}
    </span>
  );
}
