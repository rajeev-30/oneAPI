"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import Image from "next/image";
import icon from "../../icon.png";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const redirectUrl: string = searchParams.get("redirect") || "/dashboard";

  const validate = () => {
    const errs: typeof errors = {};
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login({ email, password });
      dispatch(setUser(user));
      toast.success("Welcome back, " + user.name + "!");
      router.replace(redirectUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-sm animate-slide-up">
      <div className="flex items-center gap-3 justify-center mb-8">
        <Image
          src={icon}
          alt="Company Logo - oneAPI"
          width={30}
          height={30}
          priority
        />
        <span className="text-xl font-bold gradient-text">oneAPI</span>
      </div>
      <div className="rounded-2xl border border-border-primary bg-surface-secondary p-6 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-lg font-semibold text-text-primary">
            Welcome back
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Sign in to your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            error={errors.email}
            icon={<Mail size={16} />}
            autoFocus
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={errors.password}
            icon={<Lock size={16} />}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Sign In
          </Button>
        </form>
        <p className="text-sm text-text-muted text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            href={`/signup?redirect=${redirectUrl}`}
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
