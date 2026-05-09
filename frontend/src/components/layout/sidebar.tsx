"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import {
  LayoutDashboard, Key, BarChart3, CreditCard, Settings, PanelLeftClose, ChevronRight,
} from "lucide-react";

const MAIN_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/keys", label: "API Keys", icon: Key },
  { href: "/usage", label: "Usage", icon: BarChart3 },
  { href: "/plans", label: "Plans", icon: ChevronRight },
];

const ACCOUNT_NAV = [
  { href: "/billing", label: "Credits", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { sidebarCollapsed, isMobile } = useAppSelector((s) => s.ui);
  const handleNavClick = () => {
    if (isMobile) dispatch(toggleSidebar());
  };

  if (isMobile && sidebarCollapsed) return null;

  return (
    <>
      {isMobile && !sidebarCollapsed && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs" onClick={() => dispatch(toggleSidebar())} />
      )}
      <aside
        className={cn(
          "flex flex-col border-r border-border-primary bg-surface-secondary transition-all duration-200 z-50",
          isMobile ? "fixed left-0 top-14 bottom-0 w-70" : "relative shrink-0",
          !isMobile && (sidebarCollapsed ? "w-14" : "w-65"),
        )}
      >
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {/* Main section */}
          <div className="space-y-0.5">
            {MAIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 my-2 rounded-md text-sm text-sm font-medium transition-colors",
                    isActive ? "bg-white/[0.08] text-text-primary font-medium" : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                    sidebarCollapsed && !isMobile && "justify-center px-0",
                  )}
                >
                  <Icon size={16} className={cn(isActive && "text-brand-400", "shrink-0")} />
                  {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Account section */}
          <div className="space-y-0.5">
            {(!sidebarCollapsed || isMobile) && (
              <p className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-text-muted mb-1">Account</p>
            )}
            {ACCOUNT_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-2 my-2 rounded-md text-sm font-medium transition-colors",
                    isActive ? "bg-white/[0.08] text-text-primary font-medium" : "text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
                    sidebarCollapsed && !isMobile && "justify-center px-0",
                  )}
                >
                  <Icon size={16} className={cn(isActive && "text-brand-400", "shrink-0")} />
                  {(!sidebarCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Collapse toggle */}
        {!isMobile && (
          <div className="border-t border-border-primary p-2">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="w-full flex items-center justify-center p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <PanelLeftClose size={14} className={cn("transition-transform", sidebarCollapsed && "rotate-180")} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
