"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full h-10 rounded-lg px-3 text-sm transition-all duration-200",
              "bg-surface-secondary border border-border-primary",
              "text-text-primary placeholder:text-text-muted",
              "hover:border-border-active",
              "focus:outline-none focus:ring-2 focus:ring-accent-blue/40 focus:border-accent-blue",
              icon && "pl-10",
              error && "border-accent-rose focus:ring-accent-rose/40 focus:border-accent-rose",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-accent-rose animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
