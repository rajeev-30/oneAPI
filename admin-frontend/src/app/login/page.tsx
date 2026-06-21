"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store";
import { Zap, Mail, Lock, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const user = await login({ email, password });
      dispatch(setUser(user));
      router.push("/admin/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)]" />
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Shield size={24} className="text-brand-400" />
          </div>
          <div>
            <span className="text-xl font-bold gradient-text">oneAPI</span>
            <p className="text-xs text-text-muted">Admin Panel</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border-primary bg-bg-card p-6 shadow-2xl">
          <div className="text-center mb-6">
            <h1 className="text-lg font-semibold text-text-primary">
              Admin Login
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Access the control panel
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Email
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary focus-within:border-border-active transition-colors">
                <Mail size={14} className="text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary focus-within:border-border-active transition-colors">
                <Lock size={14} className="text-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 rounded-lg bg-brand-500 text-white font-medium text-sm hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
