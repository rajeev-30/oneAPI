"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { clearAuth } from "@/store/slices/authSlice";
import { logout as logoutApi } from "@/lib/api/auth";
import { LogOut, ChevronDown, LayoutDashboard, CreditCard, Settings, BarChart3, ChevronUp, PanelLeftOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { HiMenuAlt4 } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import icon from '../../app/icon.png';
import Image from "next/image";


const NAV_LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/playground", label: "Playground" },
  { href: "/models", label: "Models" },
  { href: "/docs", label: "Docs" },
];

const PUBLIC_PATH_PREFIXES = ["/login", "/signup", "/docs"];

export function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { isMobile, sidebarCollapsed } = useAppSelector((s) => s.ui);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPublicRoute = pathname === "/" || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

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
      toast.error("Logout failed!");
    }
  };

  return (
    <nav className="h-14 border-b border-border-primary bg-surface-primary/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 md:px-8 gap-4">
      {/* Mobile sidebar toggle */}
      {isMobile && !isPublicRoute && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors"
        >
          {sidebarCollapsed ? <HiMenuAlt4 size={20} /> : <RxCross2 size={20} />}
        </button>
      )}

      {/* Logo */}
      <Link href={"/"} className="flex items-center gap-2 mr-2">
          <Image
            src={icon}
            alt="Company Logo - oneAPI"
            width={25}      
            height={25}     
            priority         
          />
        <span className="font-medium gwradient-text">oneAPI</span>
      </Link>

      {/* Search */}
      {/* <div className="flex-1 max-w-xs">
        <div className="flex items-center gap-2 h-7 px-2.5 rounded-md bg-surface-secondary border border-border-secondary text-text-muted text-xs">
          <Search size={12} />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] bg-surface-primary px-1 rounded">⌘+K</kbd>
        </div>
      </div> */}

      <div className="flex-1" />

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "text-text-secondary hover:text-text-primary hover:bg-white/[0.10]",
              pathname.startsWith(link.href)
                ? "text-text-primary"
                : ""
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* User */}
      {isAuthenticated ? (
        <div
          ref={menuRef}
          onMouseEnter={() => setUserMenuOpen(true)}
          onMouseLeave={() => setUserMenuOpen(false)}
            className="relative after:absolute after:top-full after:right-0 after:w-full after:h-2 after:content-['']"
        >
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-2xl text-sm font-black text-text-secondary hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            {/* <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-black text-brand-400">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div> */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#1246a8] flex items-center justify-center text-white font-bold text-xs shrink-0 ">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline">{user?.name || "Account"}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${
                userMenuOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {userMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-58 rounded-lg border border-border-primary bg-surface-secondary shadow-xl animate-slide-down py-1 z-50">
              <div className="px-4 py-2 border-b border-border-secondary">
                <p className="text-base font-medium text-text-primary truncate">{user?.name}</p>
                <p className="text-sm text-text-muted truncate">{user?.email}</p>
              </div>
              <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <Settings size={16} /> Settings
              </Link>
              <Link href="/usage" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <BarChart3 size={16} /> Usage
              </Link>
              <Link href="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <CreditCard size={16} /> Credit
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-accent-rose hover:bg-accent-rose/10 cursor-pointer">
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm px-3 py-2 rounded-md font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.10] transition-colors">Sign in</Link>
          <Link href="/signup" className="text-sm font-medium px-3 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors font-medium">Sign up</Link>
        </div>
      )}
    </nav>
  );
}
