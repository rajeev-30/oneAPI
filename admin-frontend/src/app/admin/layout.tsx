"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser, setLoading, clearAuth, toggleSidebar } from "@/store";
import { getUser, logout } from "@/lib/api/auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Layers, Globe, DollarSign, FileText,
  Users, Key, Activity, Settings, LogOut, Shield,
  PanelLeftClose, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/models", label: "Models", icon: Layers },
  { href: "/admin/providers", label: "Providers", icon: Globe },
  { href: "/admin/billing", label: "Pricing", icon: DollarSign },
  { href: "/admin/plans", label: "Plans", icon: FileText },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/keys", label: "API Keys", icon: Key },
  { href: "/admin/logs", label: "Logs", icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { sidebarCollapsed } = useAppSelector((s) => s.ui);

  useEffect(() => {
    const verify = async () => {
      try {
        dispatch(setLoading(true));
        const u = await getUser();
        dispatch(setUser(u));
      } catch {
        dispatch(clearAuth());
        router.push("/login");
      }
    };
    if (!user) verify();
    else dispatch(setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    try { await logout(); } catch { /* silent */ }
    dispatch(clearAuth());
    router.push("/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg-primary">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <aside className={cn("flex flex-col border-r border-border-primary bg-bg-secondary transition-all duration-200 shrink-0", sidebarCollapsed ? "w-14" : "w-56")}>
        {/* Logo */}
        <div className="h-12 flex items-center gap-2 px-3 border-b border-border-primary">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
            <Shield size={14} className="text-brand-400" />
          </div>
          {!sidebarCollapsed && <span className="text-sm font-bold gradient-text">oneAPI Admin</span>}
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} title={sidebarCollapsed ? item.label : undefined} className={cn("flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all", active ? "bg-brand-500/10 text-brand-400 font-medium" : "text-text-secondary hover:text-text-primary hover:bg-white/[0.03]", sidebarCollapsed && "justify-center px-0")}>
                <Icon size={16} className="shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="border-t border-border-primary p-2 space-y-1">
          {!sidebarCollapsed && (
            <div className="px-2.5 py-1.5 mb-1">
              <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
            </div>
          )}
          <button onClick={handleLogout} className={cn("flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer", sidebarCollapsed && "justify-center px-0")}>
            <LogOut size={14} />
            {!sidebarCollapsed && <span>Sign out</span>}
          </button>
          <button onClick={() => dispatch(toggleSidebar())} className={cn("flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-white/[0.03] transition-colors cursor-pointer", sidebarCollapsed && "justify-center px-0")}>
            <PanelLeftClose size={14} className={cn("transition-transform", sidebarCollapsed && "rotate-180")} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
