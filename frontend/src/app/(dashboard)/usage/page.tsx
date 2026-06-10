"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMonthlyUsage } from "@/lib/api/usage";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatTokens, formatNumber, formatMonth } from "@/lib/utils/format";
import { BarChart3, TrendingUp, Coins, Activity, ChevronLeft, ChevronRight } from "lucide-react";

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }
// function shiftMonth(m: string, d: number) { const [y, mo] = m.split("-").map(Number); return new Date(y, mo - 1 + d).toISOString().slice(0, 7); }
function shiftMonth(m: string, d: number) {
  let [y, mo] = m.split("-").map(Number);
  mo += d;
  y += Math.floor((mo - 1) / 12);
  mo = ((mo - 1) % 12 + 12) % 12 + 1;
  return `${y}-${String(mo).padStart(2, "0")}`;
}

export default function UsagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const month = searchParams.get("month") || getCurrentMonth();

  const setMonth = (m: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set("month", m);
    router.push(`/usage?${p.toString()}`);
  };

  const { data: usage, isLoading, error } = useQuery({ queryKey: ["usage", month], queryFn: () => getMonthlyUsage(month), retry: false });
  const isCurrentMonth = month === getCurrentMonth();
  const maxCost = useMemo(() => !usage?.modelBreakdown?.length ? 1 : Math.max(...usage.modelBreakdown.map((m) => m.cost)), [usage]);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Activity</h1>
          <p className="text-sm text-text-muted">Your usage across models on oneAPI</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(shiftMonth(month, -1))} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer"><ChevronLeft size={18} /></button>
          <span className="text-sm font-medium text-text-primary min-w-[130px] text-center">{formatMonth(month)}</span>
          <button onClick={() => setMonth(shiftMonth(month, 1))} disabled={isCurrentMonth} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : error || !usage ? (
        <Card className="text-center py-16"><BarChart3 size={32} className="text-text-muted mx-auto mb-3" /><p className="text-sm text-text-muted">No data in this window</p></Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent-amber/10 flex items-center justify-center"><Coins size={18} className="text-accent-amber" /></div><div><p className="text-xs text-text-muted">Spend</p><p className="text-xl font-bold text-text-primary">{formatCurrency(usage.totalCost)}</p></div></div></Card>
            <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center"><Activity size={18} className="text-accent-blue" /></div><div><p className="text-xs text-text-muted">Requests</p><p className="text-xl font-bold text-text-primary">{formatNumber(usage.totalRequests)}</p></div></div></Card>
            <Card><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-accent-violet/10 flex items-center justify-center"><TrendingUp size={18} className="text-accent-violet" /></div><div><p className="text-xs text-text-muted">Tokens</p><p className="text-xl font-bold text-text-primary">{formatTokens(usage.totalTokens)}</p></div></div></Card>
          </div>
          {usage.modelBreakdown.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Model Breakdown</CardTitle></CardHeader>
              <CardContent><div className="space-y-4">
                {usage.modelBreakdown.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm"><div className="flex items-center gap-2"><span className="font-medium text-text-primary">{item.model?.name || "Unknown"}</span><Badge>{item.model?.provider?.name || "—"}</Badge></div><span className="text-text-secondary">{formatCurrency(item.cost)}</span></div>
                    <div className="h-2 bg-surface-primary rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-accent-violet rounded-full transition-all duration-500" style={{ width: `${Math.max((item.cost / maxCost) * 100, 2)}%` }} /></div>
                    <div className="flex gap-4 text-xs text-text-muted"><span>{formatNumber(item.requests)} requests</span><span>{formatTokens(item.tokens)} tokens</span></div>
                  </div>
                ))}
              </div></CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
