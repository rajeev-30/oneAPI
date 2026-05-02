"use client";

import { useQuery } from "@tanstack/react-query";
import { getModels } from "@/lib/api/models";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setSelectedModel } from "@/store/slices/chatSlice";
import { Dropdown } from "@/components/ui/dropdown";
import { Skeleton } from "@/components/ui/skeleton";
import { Cpu } from "lucide-react";

const ICONS: Record<string, string> = { openai: "🟢", google: "🔵", anthropic: "🟠", groq: "⚡", nvidia: "🟩" };

export function ModelSelector() {
  const dispatch = useAppDispatch();
  const selectedModel = useAppSelector((s) => s.chat.selectedModel);

  const { data, isLoading } = useQuery({ queryKey: ["models"], queryFn: () => getModels(1, "all"), staleTime: 5 * 60 * 1000 });

  if (isLoading) return <Skeleton className="h-7 w-44" />;

  const items = (data?.data || []).map((m) => ({
    value: m.slug,
    label: m.name,
    icon: <span className="text-sm">{ICONS[m.provider?.slug?.toLowerCase()] || <Cpu size={14} />}</span>,
    description: m.provider?.name,
  }));

  return <Dropdown items={items} value={selectedModel} onChange={(v) => dispatch(setSelectedModel(v))} placeholder="Select model" className="w-52" />;
}
