"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { clearAuth } from "@/store/slices/authSlice";
import { logout as logoutApi } from "@/lib/api/auth";
import { LogOut, ChevronDown, LayoutDashboard, CreditCard, Settings, BarChart3, Box, MessageSquare } from "lucide-react";
import { IoBookOutline } from "react-icons/io5";
import { useState, useRef, useEffect, useCallback } from "react";
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
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const { isMobile, sidebarCollapsed } = useAppSelector((s) => s.ui);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const isPublicRoute = pathname === "/" || PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  // ─── Loading bar refs (direct DOM manipulation = zero React re-renders = silky smooth) ───
  const barRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const completeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentProgressRef = useRef(0);
  const isNavigatingRef = useRef(false);

  // ─── Directly mutate bar style — no state, no re-renders ───
  const setBarStyle = useCallback((progress: number, visible: boolean, transition: string = "none") => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.transition = transition;
    // Use scaleX on a full-width bar — GPU-composited, never causes layout
    bar.style.transform = `scaleX(${progress / 100})`;
    bar.style.opacity = visible ? "1" : "0";
  }, []);

  const clearTimers = useCallback(() => {
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    rafIdRef.current = null;
    completeTimeoutRef.current = null;
    hideTimeoutRef.current = null;
  }, []);

  const startNavigation = useCallback(() => {
    clearTimers();
    isNavigatingRef.current = true;
    currentProgressRef.current = 0;

    // Snap to 0 instantly (no transition), then show
    setBarStyle(0, true, "none");

    // Kick off on next frame so the browser paints the opacity:1 first
    requestAnimationFrame(() => {
      const startTime = performance.now();

      // Easing: fast at the start, asymptotically slows toward 90
      const tick = (now: number) => {
        if (!isNavigatingRef.current) return;

        const elapsed = now - startTime;
        // Ease-out curve: reaches ~85% in ~2s, then crawls
        const target = 90 * (1 - Math.exp(-elapsed / 1800));
        currentProgressRef.current = target;

        setBarStyle(target, true, "transform 0.1s linear");
        rafIdRef.current = requestAnimationFrame(tick);
      };

      rafIdRef.current = requestAnimationFrame(tick);
    });
  }, [clearTimers, setBarStyle]);

  const completeNavigation = useCallback(() => {
    clearTimers();
    isNavigatingRef.current = false;

    // Shoot to 100% with a snappy transition
    setBarStyle(100, true, "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)");

    // Then fade out
    hideTimeoutRef.current = setTimeout(() => {
      setBarStyle(100, false, "opacity 0.3s ease");
      // Reset transform after fade so it's ready for next nav
      hideTimeoutRef.current = setTimeout(() => {
        setBarStyle(0, false, "none");
        currentProgressRef.current = 0;
      }, 320);
    }, 250);
  }, [clearTimers, setBarStyle]);

  // ─── Intercept all link clicks on the document ───
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      const nextUrl = new URL(href, window.location.href);
      if (nextUrl.origin !== window.location.origin) return;

      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${nextUrl.pathname}${nextUrl.search}`;
      if (current === next) return;

      // Same-origin, different route → start bar immediately on click
      startNavigation();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startNavigation]);

  // ─── Complete bar when route actually changes ───
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    // Route changed → finish the bar
    if (isNavigatingRef.current) {
      completeNavigation();
    }
  }, [pathname, searchParams, completeNavigation]);

  // ─── Close user menu on outside click ───
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
    <nav className="relative h-14 border-b border-border-primary bg-surface-primary/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 md:px-8 gap-4">

      {/*
        Loading bar — full width, transform-origin left, animated via scaleX.
        GPU-composited (no layout thrash), ultra smooth.
        Initial state: scaleX(0), opacity 0
      */}
      <div
        ref={barRef}
        className="absolute left-0 top-0 h-0.5 w-full bg-brand-500 pointer-events-none"
        style={{
          transform: "scaleX(0)",
          transformOrigin: "left center",
          opacity: 0,
          willChange: "transform, opacity",
        }}
        aria-hidden="true"
      />

      {/* Mobile sidebar toggle */}
      {isMobile && !isPublicRoute && (
        <button
          onClick={() => dispatch(toggleSidebar())}
          aria-label="Toggle sidebar"
          className="p-2 text-text-secondary"
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
              pathname.startsWith(link.href) ? "text-text-primary" : ""
            )}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* User menu */}
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
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1a73e8] to-[#1246a8] flex items-center justify-center text-white font-bold text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="hidden sm:inline">{user?.name || "Account"}</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : "rotate-0"}`}
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
              <Link href="/models" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <Box size={17} />  Models
              </Link>
              <Link href="/playground" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <MessageSquare size={16} />  Playground
              </Link>
              <Link href="/docs" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-white/[0.06]">
                <IoBookOutline size={16} /> Docs
              </Link>

              <div className="px-4 border-b border-border-primary"></div>

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
          <Link href="/signup" className="text-sm font-medium px-3 py-2 rounded-md bg-brand-500 text-white hover:bg-brand-600 transition-colors">Sign up</Link>
        </div>
      )}
    </nav>
  );
}