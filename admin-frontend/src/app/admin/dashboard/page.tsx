"use client";

import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "@/lib/api/admin";
import {
  Users,
  Layers,
  Activity,
  DollarSign,
  Globe,
  FileText,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function DashboardPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
    retry: false,
  });

  if (isLoading)
    return (
      <div className="p-6 space-y-6 animate-fade-in">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-xl bg-bg-card border border-border-primary animate-pulse"
          />
        ))}
      </div>
    );

  const c = analytics?.counts;
  const r = analytics?.revenue;

  const metrics = [
    {
      label: "Total Users",
      value: c?.totalUsers || 0,
      icon: Users,
      color: "text-accent-blue",
      bg: "bg-accent-blue/10",
    },
    {
      label: "Total Models",
      value: c?.totalModels || 0,
      icon: Layers,
      color: "text-brand-400",
      bg: "bg-brand-500/10",
    },
    {
      label: "Providers",
      value: c?.totalProviders || 0,
      icon: Globe,
      color: "text-accent-emerald",
      bg: "bg-accent-emerald/10",
    },
    {
      label: "Requests",
      value: c?.totalRequestLogs || 0,
      icon: Activity,
      color: "text-accent-violet",
      bg: "bg-accent-violet/10",
    },
    {
      label: "Revenue",
      value: `₹${(r?.totalRevenue || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-accent-amber",
      bg: "bg-accent-amber/10",
    },
    {
      label: "Active Subs",
      value: c?.activeSubscriptions || 0,
      icon: TrendingUp,
      color: "text-accent-emerald",
      bg: "bg-accent-emerald/10",
    },
  ];

  const chartData =
    analytics?.monthlyUsage
      ?.map((m) => ({
        month: m.month,
        Requests: m.totalRequests,
        Revenue: Number(m.totalCost.toFixed(2)),
        Users: m.activeUsers,
      }))
      .reverse() || [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted">Platform overview</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border-primary bg-bg-card p-4 hover:border-border-active transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-muted">{m.label}</span>
              <div
                className={`w-7 h-7 rounded-lg ${m.bg} flex items-center justify-center`}
              >
                <m.icon size={14} className={m.color} />
              </div>
            </div>
            <p className="text-xl font-bold text-text-primary">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Monthly Requests
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a3e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Requests" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-xl border border-border-primary bg-bg-card p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">
              Monthly Revenue (₹)
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a3e",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent logs */}
      {analytics?.recentLogs && analytics.recentLogs.length > 0 && (
        <div className="rounded-xl border border-border-primary bg-bg-card p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Recent Requests
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border-primary text-text-muted">
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-left py-2 px-2">Model</th>
                  <th className="text-left py-2 px-2">Tokens</th>
                  <th className="text-left py-2 px-2">Cost</th>
                  <th className="text-left py-2 px-2">Latency</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-border-primary/50 hover:bg-white/[0.02]"
                  >
                    <td className="py-2 px-2 text-text-secondary">
                      {typeof log.user === "object" ? log.user.name : "—"}
                    </td>
                    <td className="py-2 px-2 text-text-primary font-mono">
                      {typeof log.model === "object" ? log.model.slug : "—"}
                    </td>
                    <td className="py-2 px-2 text-text-secondary">
                      {log.totalTokens.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-text-secondary">
                      ₹{log.cost.toFixed(4)}
                    </td>
                    <td className="py-2 px-2 text-text-secondary">
                      {log.latencyMs}ms
                    </td>
                    <td className="py-2 px-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          log.status === "success"
                            ? "bg-accent-emerald/10 text-accent-emerald"
                            : "bg-accent-rose/10 text-accent-rose"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
