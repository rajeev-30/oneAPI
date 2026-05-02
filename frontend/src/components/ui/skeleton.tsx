"use client";

import { cn } from "@/lib/utils/cn";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-md bg-white/[0.06] animate-pulse-soft",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
