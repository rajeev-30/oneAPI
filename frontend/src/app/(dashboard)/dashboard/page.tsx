"use client";

import { useQuery } from "@tanstack/react-query";
import { getMonthlyUsage } from "@/lib/api/usage";
import { getApiKeys } from "@/lib/api/keys";
import { getWallet } from "@/lib/api/wallet";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatTokens, formatNumber } from "@/lib/utils/format";
import {
  Activity,
  Coins,
  TrendingUp,
  Key,
  ArrowRight,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const month = getCurrentMonth();
  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ["usage", month],
    queryFn: () => getMonthlyUsage(month),
    retry: false,
  });
  const { data: keys, isLoading: keysLoading } = useQuery({
    queryKey: ["apiKeys"],
    queryFn: getApiKeys,
    retry: false,
  });
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: getWallet,
    retry: false,
  });

  const metrics = [
    {
      label: "Spend",
      value: usage ? formatCurrency(usage.totalCost) : "₹0",
      icon: Coins,
      color: "text-accent-amber",
      bg: "bg-accent-amber/10",
      loading: usageLoading,
    },
    {
      label: "Requests",
      value: usage ? formatNumber(usage.totalRequests) : "0",
      icon: Activity,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
      loading: usageLoading,
    },
    {
      label: "Tokens",
      value: usage ? formatTokens(usage.totalTokens) : "0",
      icon: TrendingUp,
      color: "text-accent-violet",
      bg: "bg-accent-violet/10",
      loading: usageLoading,
    },
  ];

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted">Your API usage overview</p>
      </div>

      {/* Metric cards — matching OpenRouter Activity page */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <Card key={m.label} className="relative overflow-hidden">
            {m.loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <>
                <p className="text-xs text-text-muted mb-1">{m.label}</p>
                <p className="text-2xl font-bold text-text-primary">
                  {m.value}
                </p>
                <div className="mt-4 flex items-center justify-center h-12">
                  <div
                    className={`w-10 h-10 rounded-lg ${m.bg} flex items-center justify-center`}>
                    <m.icon size={18} className={m.color} />
                  </div>
                </div>
                <p className="text-[10px] text-text-muted text-center mt-2">
                  This month
                </p>
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/keys" className="group">
          <Card hover className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <Key size={16} className="text-brand-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">API Keys</p>
              <p className="text-xs text-text-muted">
                {keysLoading ? "..." : `${keys?.length || 0} active keys`}
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-text-muted group-hover:text-text-primary transition-colors"
            />
          </Card>
        </Link>

        <Link href="/billing" className="group">
          <Card hover className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
              <Coins size={16} className="text-accent-emerald" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Credits</p>
              <p className="text-xs text-text-muted">
                {walletLoading ? "..." : formatCurrency(wallet?.balance ?? 0)}
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-text-muted group-hover:text-text-primary transition-colors"
            />
          </Card>
        </Link>

        <Link href="/docs" className="group">
          <Card hover className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-blue/10 flex items-center justify-center">
              <FileText size={16} className="text-accent-blue" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                Documentation
              </p>
              <p className="text-xs text-text-muted">
                API reference & examples
              </p>
            </div>
            <ArrowRight
              size={14}
              className="text-text-muted group-hover:text-text-primary transition-colors"
            />
          </Card>
        </Link>
      </div>

      {/* Model breakdown */}
      {usage && usage.modelBreakdown && usage.modelBreakdown.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-primary">
              Model Usage
            </h2>
            <Link
              href="/usage"
              className="text-xs text-brand-400 hover:text-brand-300">
              View details →
            </Link>
          </div>
          <div className="space-y-3">
            {usage.modelBreakdown.slice(0, 5).map((item, i) => {
              const maxCost = Math.max(
                ...usage.modelBreakdown.map((m) => m.cost),
              );
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-primary font-medium">
                      {item.model?.name || "Unknown"}
                    </span>
                    <span className="text-text-muted">
                      {formatCurrency(item.cost)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-surface-primary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-500 to-accent-violet rounded-full"
                      style={{
                        width: `${Math.max((item.cost / maxCost) * 100, 3)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
