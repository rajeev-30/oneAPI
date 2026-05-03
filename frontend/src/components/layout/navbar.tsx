"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { clearAuth } from "@/store/slices/authSlice";
import { logout as logoutApi } from "@/lib/api/auth";
import { Zap, Search, LogOut, ChevronDown, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "home" },
  { href: "/playground", label: "Playground" },
  { href: "/models", label: "Models" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(clearAuth());
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="h-12 border-b border-border-primary bg-surface-primary/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 gap-4">
      {/* Logo */}
      <Link href={"/"} className="flex items-center gap-2 mr-2">
        <div className="w-6 h-6 rounded-md bg-brand-500/20 flex items-center justify-center">
          <Zap size={13} className="text-brand-400" />
        </div>
        <span className="text-sm font-bold gradient-text hidden sm:inline">oneAPI</span>
      </Link>

      {/* Search */}
      <div className="flex-1 max-w-xs">
        <div className="flex items-center gap-2 h-7 px-2.5 rounded-md bg-surface-secondary border border-border-secondary text-text-muted text-xs">
          <Search size={12} />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] bg-surface-primary px-1 rounded">⌘K</kbd>
        </div>
      </div>

      <div className="flex-1" />

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              pathname.startsWith(link.href)
                ? "text-text-primary bg-white/[0.06]"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* User */}
      {isAuthenticated ? (
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-[10px] font-bold text-brand-400">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline">{user?.name || "Account"}</span>
            <ChevronDown size={12} />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border-primary bg-surface-secondary shadow-xl animate-slide-down py-1 z-50">
              <div className="px-3 py-2 border-b border-border-secondary">
                <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
              <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-white/[0.04]">
                <User size={12} /> Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-accent-rose hover:bg-accent-rose/10 cursor-pointer">
                <LogOut size={12} /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-xs text-text-secondary hover:text-text-primary transition-colors">Sign in</Link>
          <Link href="/signup" className="text-xs px-3 py-1.5 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
