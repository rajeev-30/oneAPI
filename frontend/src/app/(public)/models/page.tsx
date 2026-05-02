"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getModels } from "@/lib/api/models";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import { Layers, Search } from "lucide-react";
import Link from "next/link";

const ICONS: Record<string, string> = { openai: "🟢", google: "🔵", anthropic: "🟠", groq: "⚡", nvidia: "🟩" };

export default function PublicModelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const provider = searchParams.get("provider") || "";
  const q = searchParams.get("q") || "";

  const { data, isLoading } = useQuery({ queryKey: ["models"], queryFn: () => getModels(1, "all"), staleTime: 5 * 60 * 1000 });
  const all = data?.data || [];
  const providers = useMemo(() => [...new Set(all.map((m) => m.provider?.slug).filter(Boolean))], [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (provider) r = r.filter((m) => m.provider?.slug === provider);
    if (q) r = r.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()) || m.slug.toLowerCase().includes(q.toLowerCase()));
    return r;
  }, [all, provider, q]);

  const up = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    val ? p.set(key, val) : p.delete(key);
    router.push(`/models?${p.toString()}`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Models</h1>
          <p className="text-sm text-text-muted">{filtered.length} models available</p>
        </div>
        <div className="w-64"><Input placeholder="Search models..." value={q} onChange={(e) => up("q", e.target.value)} icon={<Search size={14} />} className="h-8 text-xs" /></div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => up("provider", "")} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${!provider ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-border-primary text-text-secondary hover:text-text-primary"}`}>All</button>
        {providers.map((p) => (
          <button key={p} onClick={() => up("provider", provider === p ? "" : p)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${provider === p ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-border-primary text-text-secondary hover:text-text-primary"}`}>
            <span>{ICONS[p] || "🤖"}</span> {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><Layers size={28} className="text-text-muted mx-auto mb-3" /><p className="text-sm text-text-muted">No models found</p></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((model) => (
            <div key={model._id} className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border-primary hover:border-border-active hover:bg-surface-secondary/50 transition-colors">
              <span className="text-lg">{ICONS[model.provider?.slug?.toLowerCase()] || "🤖"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><h3 className="text-sm font-semibold text-text-primary">{model.name}</h3><Badge variant="info">{model.provider?.name}</Badge></div>
                <p className="text-xs text-text-muted font-mono mt-0.5">{model.slug}</p>
              </div>
              {model.billing && (<div className="text-right text-xs text-text-muted shrink-0"><p>Input: {formatCurrency(model.billing.inputCostPer1KTokens)}/1K</p><p>Output: {formatCurrency(model.billing.outputCostPer1KTokens)}/1K</p></div>)}
            </div>
          ))}
        </div>
      )}

      <div className="text-center pt-4">
        <Link href="/signup" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Sign up to start using these models →</Link>
      </div>
    </div>
  );
}
