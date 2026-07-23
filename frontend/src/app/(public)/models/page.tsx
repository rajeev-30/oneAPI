"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getModels } from "@/lib/api/models";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import { Layers, Search, X, Copy, Check } from "lucide-react";
import { PROVIDER_CONFIG } from "@/lib/utils/provider";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function PublicModelsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const provider = searchParams.get("provider") || "";
  const q = searchParams.get("q") || "";
  const [searchModel, setSearchModel] = useState(q || "");

  const { data, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: () => getModels(1, "all"),
    staleTime: 5 * 60 * 1000,
  });
  const all = data?.data || [];
  const providers = useMemo(
    () => [...new Set(all.map((m) => m.provider?.slug).filter(Boolean))],
    [all],
  );

  const filtered = useMemo(() => {
    let r = all;
    if (provider) r = r.filter((m) => m.provider?.slug === provider);
    if (q)
      r = r.filter(
        (m) =>
          m.name.toLowerCase().includes(q.toLowerCase()) ||
          m.slug.toLowerCase().includes(q.toLowerCase()),
      );
    return r;
  }, [all, provider, q]);

  const debouncedSearch = useDebounce(searchModel, 300);

  useEffect(() => {
    // Guard: If the URL already matches the debounced state, stop.
    if (debouncedSearch === q) return;

    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("q", debouncedSearch);
    } else {
      params.delete("q");
    }

    router.push(`/models?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, router, searchParams, q]);

  const handleCopy = async (modelSlug: string, id: string) => {
    await navigator.clipboard.writeText(modelSlug);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const up = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    const newVal = p.get(key);
    if (newVal === val) return;
    val ? p.set(key, val) : p.delete(key);
    router.push(`/models?${p.toString()}`, { scroll: false });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Models</h1>
          <p className="text-sm text-text-muted">
            {filtered.length} models available
          </p>
        </div>
        <div className="w-64">
          <Input
            placeholder="Search models..."
            value={searchModel}
            onChange={(e) => setSearchModel(e.target.value)}
            icon={<Search size={14} />}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => up("provider", "")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${!provider ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-border-primary text-text-secondary hover:text-text-primary"}`}>
          All
        </button>
        {providers.map((p) => {
          const Icon = PROVIDER_CONFIG[p]?.icon;

          return (
            <button
              key={p}
              onClick={() => up("provider", p)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${provider === p ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-border-primary text-text-secondary hover:text-text-primary"}`}>
              <span>{Icon ? <Icon size={18} /> : "🤖"}</span>
              {PROVIDER_CONFIG[p]?.label || "Default"}
            </button>
          );
        })}
      </div> */}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Layers size={28} className="text-text-secondary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">
            No matching models found for your search.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((model) => {
            const provider = model?.slug.split("/")[0] || model?.provider?.slug?.toLowerCase() || "";
            const Icon = PROVIDER_CONFIG[provider]?.icon;

            return (
              <div
                key={model._id}
                className="group flex items-center gap-4 px-4 py-3 rounded-xl border border-border-primary hover:border-accent-blue hover:bg-surface-tertiary transition-colors">
                <span className="text-lg">
                  {Icon ? <Icon size={18} /> : "🤖"}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font- text-text-primary">
                      {model.name}
                    </h3>

                    {/* <Badge variant="info" className="text-xs">
                      {provider}
                    </Badge> */}

                    <button
                      onClick={() => handleCopy(model.slug, model._id)}
                      className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-all duration-150 cursor-pointer opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
                      {copiedId === model._id ? (
                        <Check size={14} className="text-accent-emerald" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-text-secondary font-mono mt-0.5">
                    {model.slug}
                  </p>
                </div>

                {model.billing && (
                  <div className="text-right text-xs text-text-secondary shrink-0">
                    <p>
                      Input:{" "}
                      {formatCurrency(model.billing.inputCostPer1KTokens)}/1K
                    </p>
                    <p>
                      Output:{" "}
                      {formatCurrency(model.billing.outputCostPer1KTokens)}/1K
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* <div className="text-center pt-4">
        <Link href="/signup" className="text-sm text-brand-400 hover:text-brand-300 font-medium">Sign up to start using these models →</Link>
      </div> */}
    </div>
  );
}
