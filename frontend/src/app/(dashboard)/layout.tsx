"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser, setLoading, clearAuth } from "@/store/slices/authSlice";
import { setMobile } from "@/store/slices/uiSlice";
import { getUser } from "@/lib/api/auth";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);

  // Auth guard
  useEffect(() => {
    const verify = async () => {
      try {
        dispatch(setLoading(true));
        const userData = await getUser();
        dispatch(setUser(userData));
      } catch {
        dispatch(clearAuth());
        router.push("/login");
      }
    };
    if (!user) verify();
    else dispatch(setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mobile detection
  useEffect(() => {
    const check = () => dispatch(setMobile(window.innerWidth < 768));
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-primary">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-surface-primary overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
