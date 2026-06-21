"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllApiKeys } from "@/lib/api/admin";
import type { ApiKey, PaginationInfo, User } from "@/types";
import { Key, ChevronLeft, ChevronRight } from "lucide-react";

export default function KeysPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-keys", page],
    queryFn: () => getAllApiKeys(page, 20),
    retry: false,
  });

  const keys: ApiKey[] = (data?.data as ApiKey[]) || [];
  const pagination: PaginationInfo | undefined = data?.pagination;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold">API Keys</h1>
        <p className="text-sm text-text-muted">
          {pagination
            ? `${pagination.total_items} keys across all users`
            : "All API keys on the platform"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-bg-card border border-border-primary animate-pulse"
            />
          ))}
        </div>
      ) : !keys.length ? (
        <div className="text-center py-16 text-text-muted text-sm">
          No API keys generated yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-primary bg-bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary text-text-muted text-xs">
                <th className="text-left py-3 px-4">Key Name</th>
                <th className="text-left py-3 px-4">Owner</th>
                <th className="text-left py-3 px-4">Key</th>
                <th className="text-right py-3 px-4">Requests</th>
                <th className="text-right py-3 px-4">Tokens</th>
                <th className="text-right py-3 px-4">Spent</th>
                <th className="text-left py-3 px-4">Last Used</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const owner =
                  typeof k.user === "object" ? (k.user as User) : null;
                return (
                  <tr
                    key={k._id}
                    className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-accent-amber/10 flex items-center justify-center">
                          <Key size={11} className="text-accent-amber" />
                        </div>
                        <span className="font-medium text-xs">{k.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">
                      {owner?.name || "—"}
                      <br />
                      <span className="text-text-muted text-[10px]">
                        {owner?.email || ""}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-muted font-mono text-[10px]">
                      {k.key.slice(0, 16)}...{k.key.slice(-4)}
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs font-mono">
                      {k.totalRequests.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs font-mono">
                      {k.totalTokensUsed.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-secondary text-xs font-mono">
                      ₹{k.totalSpent.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-text-muted text-[11px]">
                      {k.lastUsedAt
                        ? new Date(k.lastUsedAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })
                        : "Never"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            Page {pagination.current_page} of {pagination.last_page}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.last_page, p + 1))
              }
              disabled={page >= pagination.last_page}
              className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
