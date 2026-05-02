"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, toggleUserStatus } from "@/lib/api/admin";
import type { User, PaginationInfo } from "@/types";
import { Users as UsersIcon, ShieldCheck, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => getUsers(page, 20),
    retry: false,
  });

  const users: User[] = (data?.data as User[]) || [];
  const pagination: PaginationInfo | undefined = data?.pagination;

  const toggleMut = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => toggleUserStatus(id, { isActive: active }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("User status updated"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold">Users</h1>
        <p className="text-sm text-text-muted">
          {pagination ? `${pagination.total_items} total users` : "Manage platform users"}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-bg-card border border-border-primary animate-pulse" />)}</div>
      ) : !users.length ? (
        <div className="text-center py-16 text-text-muted text-sm">No users found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-primary bg-bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary text-text-muted text-xs">
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-border-primary/50 hover:bg-white/[0.02] group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-text-secondary text-xs">{u.email}</td>
                  <td className="py-3 px-4 text-text-muted text-xs">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${u.isActive ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose"}`}>
                      {u.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => toggleMut.mutate({ id: u._id, active: !u.isActive })}
                      disabled={toggleMut.isPending}
                      className="flex items-center gap-1 ml-auto px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.04] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {u.isActive ? <><ShieldOff size={11} />Ban</> : <><ShieldCheck size={11} />Activate</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-text-muted">
            Page {pagination.current_page} of {pagination.last_page}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"><ChevronLeft size={14} /></button>
            <button onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page >= pagination.last_page} className="p-1.5 rounded-lg border border-border-primary text-text-muted hover:text-text-primary disabled:opacity-30 cursor-pointer"><ChevronRight size={14} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
