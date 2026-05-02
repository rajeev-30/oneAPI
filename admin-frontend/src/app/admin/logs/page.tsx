"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequestLogs } from "@/lib/api/admin";
import type { RequestLog, PaginationInfo } from "@/types";
import { Activity, ChevronLeft, ChevronRight, Filter } from "lucide-react";

export default function LogsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["logs", page, statusFilter],
    queryFn: () => getRequestLogs(page, 20, statusFilter ? { status: statusFilter } : undefined),
    retry: false,
  });

  const logs: RequestLog[] = (data?.data as RequestLog[]) || [];
  const pagination: PaginationInfo | undefined = data?.pagination;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Request Logs</h1>
          <p className="text-sm text-text-muted">
            {pagination ? `${pagination.total_items} total requests` : "All API request logs"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-text-muted" />
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-2 py-1 rounded-lg border border-border-primary bg-bg-secondary text-xs text-text-primary focus:outline-none focus:border-border-active">
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-bg-card border border-border-primary animate-pulse" />)}</div>
      ) : !logs.length ? (
        <div className="text-center py-16 text-text-muted text-sm">No request logs found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-primary bg-bg-card">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border-primary text-text-muted">
                <th className="text-left py-3 px-3">User</th>
                <th className="text-left py-3 px-3">Model</th>
                <th className="text-left py-3 px-3">Provider</th>
                <th className="text-right py-3 px-3">Prompt</th>
                <th className="text-right py-3 px-3">Completion</th>
                <th className="text-right py-3 px-3">Total</th>
                <th className="text-right py-3 px-3">Cost</th>
                <th className="text-right py-3 px-3">Latency</th>
                <th className="text-center py-3 px-3">Status</th>
                <th className="text-left py-3 px-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const user = typeof log.user === "object" ? log.user : null;
                const model = typeof log.model === "object" ? log.model : null;
                const provider = typeof log.provider === "object" ? log.provider : null;
                return (
                  <tr key={log._id} className="border-b border-border-primary/50 hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-text-secondary">{user?.name || "—"}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-text-primary">{model?.slug || "—"}</td>
                    <td className="py-2.5 px-3"><span className="px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue text-[10px]">{provider?.name || "—"}</span></td>
                    <td className="py-2.5 px-3 text-right text-text-secondary font-mono">{log.promptTokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-text-secondary font-mono">{log.completionTokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-text-primary font-mono font-medium">{log.totalTokens.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right text-accent-amber font-mono">₹{log.cost.toFixed(4)}</td>
                    <td className="py-2.5 px-3 text-right text-text-secondary font-mono">{log.latencyMs}ms</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${log.status === "success" ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose"}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-muted">
                      {new Date(log.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}{" "}
                      {new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
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
          <p className="text-xs text-text-muted">Page {pagination.current_page} of {pagination.last_page}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page >= pagination.last_page} className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
