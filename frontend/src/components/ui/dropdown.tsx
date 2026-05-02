"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
}

interface DropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function Dropdown({
  items,
  value,
  onChange,
  placeholder = "Select...",
  className,
  triggerClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = items.find((item) => item.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 h-9 px-3 rounded-lg text-sm transition-all duration-200 cursor-pointer w-full",
          "bg-surface-secondary border border-border-primary",
          "hover:border-border-active hover:bg-surface-tertiary",
          "text-text-primary",
          open && "border-accent-blue ring-2 ring-accent-blue/20",
          triggerClassName
        )}
      >
        {selected?.icon}
        <span className="flex-1 text-left truncate">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={14}
          className={cn(
            "text-text-muted transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[200px] rounded-lg border border-border-primary bg-surface-secondary shadow-xl animate-slide-down overflow-hidden">
          <div className="max-h-64 overflow-y-auto py-1">
            {items.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors cursor-pointer",
                  "hover:bg-white/[0.06]",
                  item.value === value
                    ? "text-accent-blue bg-accent-blue/[0.08]"
                    : "text-text-secondary"
                )}
              >
                {item.icon}
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-text-muted mt-0.5">
                      {item.description}
                    </div>
                  )}
                </div>
                {item.value === value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
