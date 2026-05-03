"use client";

import { useQuery } from "@tanstack/react-query";
import { getModels } from "@/lib/api/models";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedModel } from "@/store/slices/chatSlice";
import { useEffect, useRef, useState, useMemo } from "react";
import { Search, X, ChevronDown, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// ─── Provider config ──────────────────────────────────────────────────────────
const PROVIDERS: Record<string, { label: string; color: string; dot: string }> = {
  all:       { label: "All",       color: "bg-[#3a3a3a] text-[#e0e0e0]", dot: "" },
  openai:    { label: "OpenAI",    color: "bg-[#10a37f]/15 text-[#10a37f]", dot: "bg-[#10a37f]" },
  anthropic: { label: "Anthropic", color: "bg-[#cc785c]/15 text-[#cc785c]", dot: "bg-[#cc785c]" },
  google:    { label: "Google",    color: "bg-[#4285f4]/15 text-[#4285f4]", dot: "bg-[#4285f4]" },
  meta:      { label: "Meta",      color: "bg-[#0668e1]/15 text-[#4a9eff]", dot: "bg-[#4a9eff]" },
  mistral:   { label: "Mistral",   color: "bg-[#f7931e]/15 text-[#f7931e]", dot: "bg-[#f7931e]" },
  groq:      { label: "Groq",      color: "bg-[#f55036]/15 text-[#f55036]", dot: "bg-[#f55036]" },
  cohere:    { label: "Cohere",    color: "bg-[#39b5ac]/15 text-[#39b5ac]", dot: "bg-[#39b5ac]" },
  xai:       { label: "xAI",       color: "bg-[#8b5cf6]/15 text-[#a78bfa]", dot: "bg-[#a78bfa]" },
};

const PROVIDER_DOT_FALLBACK = "bg-[#666]";

function getProviderKey(slug: string): string {
  const lower = slug?.toLowerCase() ?? "";
  for (const key of Object.keys(PROVIDERS)) {
    if (key !== "all" && lower.includes(key)) return key;
  }
  return "other";
}

function getProviderDot(key: string): string {
  return PROVIDERS[key]?.dot ?? PROVIDER_DOT_FALLBACK;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UptimeBar({ value = 0.99 }: { value?: number }) {
  const pct = Math.round(value * 100);
  const bars = 10;
  const filled = Math.round((pct / 100) * bars);
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-[3px]">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-[6px] h-[10px] rounded-[2px]",
              i < filled ? "bg-emerald-400" : "bg-[#2e2e2e]"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-[#888]">{pct}%</span>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#2a2a2a] last:border-0">
      <span className="text-xs text-[#666] font-medium tracking-wide uppercase">{label}</span>
      <span className="text-xs text-[#ccc] font-mono">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ModelSelectorProps {
  /** When used standalone (not embedded in ChatInput) */
  standalone?: boolean;
}

export function ModelSelector({ standalone = false }: ModelSelectorProps) {
  const dispatch = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeProvider, setActiveProvider] = useState("all");
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: () => getModels(1, "all"),
    staleTime: 5 * 60 * 1000,
  });

  const models = data?.data || [];

  // Focus search when popup opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Derive available providers from model list
  const availableProviders = useMemo(() => {
    const keys = new Set<string>();
    models.forEach((m) => keys.add(getProviderKey(m.provider?.slug ?? "")));
    return ["all", ...Array.from(keys).filter((k) => k !== "other" && PROVIDERS[k]).sort()];
  }, [models]);

  // Filtered + grouped models
  const { filtered, grouped } = useMemo(() => {
    let list = models;
    if (activeProvider !== "all") {
      list = list.filter((m) => getProviderKey(m.provider?.slug ?? "") === activeProvider);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) => m.name?.toLowerCase().includes(q) || m.provider?.name?.toLowerCase().includes(q)
      );
    }

    // Group by date / release label (use provider name as fallback group)
    const groups: Record<string, typeof list> = {};
    list.forEach((m) => {
      const group = m.provider?.name || "Other";
      if (!groups[group]) groups[group] = [];
      groups[group].push(m);
    });

    return { filtered: list, grouped: groups };
  }, [models, activeProvider, search]);

  const selectedModelData = models.find((m) => m.slug === selectedModel);
  const detailModel = hoveredModel
    ? models.find((m) => m.slug === hoveredModel)
    : selectedModelData;

  const selectedProviderKey = selectedModelData
    ? getProviderKey(selectedModelData.provider?.slug ?? "")
    : "other";

  // ── Trigger button ──────────────────────────────────────────────────────────
  const triggerButton = (
    <button
      onClick={() => setOpen((v) => !v)}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
        "text-[13px] font-medium text-[#bbb] hover:text-white",
        "hover:bg-[#2a2a2a] transition-all duration-150",
        "border border-transparent hover:border-[#333]",
        open && "bg-[#2a2a2a] border-[#333] text-white"
      )}
    >
      {selectedModelData && (
        <span
          className={cn(
            "inline-block w-2 h-2 rounded-full shrink-0",
            getProviderDot(selectedProviderKey)
          )}
        />
      )}
      <span className="max-w-[120px] truncate">
        {isLoading ? "Loading…" : selectedModelData?.name ?? "Select model"}
      </span>
      <ChevronDown
        size={13}
        className={cn("transition-transform duration-200 text-[#666]", open && "rotate-180")}
      />
    </button>
  );

  // ── Popup ───────────────────────────────────────────────────────────────────
  const popup = open && (
    <div
      className={cn(
        "absolute z-50 bottom-full mb-2",
        standalone ? "left-0" : "right-0"
      )}
      style={{ width: "680px" }}
    >
      {/* Backdrop blur card */}
      <div
        className={cn(
          "flex rounded-2xl overflow-hidden shadow-2xl",
          "border border-[#2a2a2a]",
          "bg-[#161616]/95 backdrop-blur-xl",
          "animate-in fade-in slide-in-from-bottom-2 duration-150"
        )}
        style={{ height: "420px" }}
      >
        {/* ── Left panel: search + list ── */}
        <div className="flex flex-col w-[340px] shrink-0 border-r border-[#222]">
          {/* Search */}
          <div className="p-3 border-b border-[#222]">
            <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#2e2e2e] rounded-xl px-3 py-2">
              <Search size={13} className="text-[#555] shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search models…"
                className="flex-1 bg-transparent text-[13px] text-[#ddd] placeholder:text-[#444] outline-none"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#555] hover:text-[#aaa]">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Provider tabs */}
          <div className="flex gap-1.5 px-3 py-2 border-b border-[#222] overflow-x-auto scrollbar-none flex-wrap">
            {availableProviders.slice(0, 4).map((key) => {
              const cfg = PROVIDERS[key] ?? { label: key, color: "bg-[#2a2a2a] text-[#888]", dot: PROVIDER_DOT_FALLBACK };
              const isActive = activeProvider === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveProvider(key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium shrink-0",
                    "transition-all duration-100",
                    isActive
                      ? cfg.color
                      : "bg-transparent text-[#555] hover:text-[#999] hover:bg-[#1e1e1e]",
                    isActive && "ring-1 ring-inset ring-current/20"
                  )}
                >
                  {key !== "all" && cfg.dot && (
                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  )}
                  {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Model list */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#2a2a2a] scrollbar-track-transparent">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#444] gap-2">
                <Search size={20} />
                <p className="text-xs">No models found</p>
              </div>
            ) : (
              Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[10px] font-semibold text-[#444] uppercase tracking-widest">
                      {group}
                    </span>
                  </div>
                  {items.map((model) => {
                    const pKey = getProviderKey(model.provider?.slug ?? "");
                    const dot = getProviderDot(pKey);
                    const isSelected = model.slug === selectedModel;
                    const isHovered = model.slug === hoveredModel;

                    return (
                      <button
                        key={model.slug}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 text-left",
                          "transition-colors duration-100",
                          isSelected
                            ? "bg-[#232323] text-white"
                            : "text-[#aaa] hover:bg-[#1c1c1c] hover:text-[#e0e0e0]",
                          isHovered && !isSelected && "bg-[#1c1c1c]"
                        )}
                        onClick={() => {
                          dispatch(setSelectedModel(model.slug));
                          setOpen(false);
                        }}
                        onMouseEnter={() => setHoveredModel(model.slug)}
                        onMouseLeave={() => setHoveredModel(null)}
                      >
                        {/* Provider dot */}
                        <span className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", dot)} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-medium truncate">{model.name}</span>
                            {model?.is_free && (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">
                                FREE
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#555] truncate block">
                            {model.provider?.name}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#cc785c] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Right panel: model detail ── */}
        <div className="flex-1 flex flex-col p-5 overflow-y-auto">
          {detailModel ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-lg",
                    "bg-[#1e1e1e] border border-[#2e2e2e]"
                  )}
                >
                  {detailModel.provider?.logo ? (
                    <img
                      src={detailModel.provider.logo}
                      alt=""
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <span className="text-base">🤖</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-semibold text-white leading-tight truncate">
                    {detailModel.name}
                  </h3>
                  <p className="text-[12px] text-[#555] mt-0.5">{detailModel.provider?.name}</p>
                </div>
              </div>

              {/* Description */}
              {detailModel.description && (
                <p className="text-[12.5px] text-[#777] leading-relaxed mb-5 line-clamp-4">
                  {detailModel.description}
                </p>
              )}

              {/* Stats */}
              <div className="mt-auto border border-[#222] rounded-xl overflow-hidden">
                <div className="bg-[#1a1a1a] px-4 py-1">
                  <StatRow
                    label="Context"
                    value={
                      detailModel.context_length
                        ? `${(detailModel.context_length / 1000).toFixed(0)}K tokens`
                        : "—"
                    }
                  />
                  <StatRow
                    label="Input"
                    value={
                      detailModel.billing?.inputCostPer1KTokens
                        ? `₹${(Number(detailModel.billing.inputCostPer1KTokens)).toFixed(2)} / K`
                        : "Free"
                    }
                  />
                  <StatRow
                    label="Output"
                    value={
                      detailModel.billing?.outputCostPer1KTokens
                        ? `₹${(Number(detailModel.billing.outputCostPer1KTokens)).toFixed(2)} / K`
                        : "Free"
                    }
                  />
                  {typeof detailModel.uptime === "number" && (
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-xs text-[#666] font-medium tracking-wide uppercase">
                        Uptime
                      </span>
                      <UptimeBar value={detailModel.uptime} />
                    </div>
                  )}
                </div>
              </div>

              {/* Capabilities */}
              {detailModel.capabilities?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {detailModel.capabilities.map((cap: string) => (
                    <span
                      key={cap}
                      className="text-[10px] font-medium px-2 py-1 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] text-[#666]"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[#333] gap-2">
              <Zap size={24} />
              <p className="text-xs">Hover a model to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative">
      {triggerButton}
      {popup}
    </div>
  );
}