"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiKeys, generateApiKey, deleteApiKey, updateApiKeyName } from "@/lib/api/keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { maskApiKey, formatRelativeTime, formatTokens, formatCurrency } from "@/lib/utils/format";
import { Plus, Copy, Trash2, Eye, EyeOff, Check, Key, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function KeysPage() {
  const qc = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data: keys, isLoading } = useQuery({ queryKey: ["apiKeys"], queryFn: getApiKeys, retry: false });

  const createMut = useMutation({
    mutationFn: (name: string) => generateApiKey(name),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["apiKeys"] });
      setShowDialog(false); setNewKeyName("");
      toast.success("API key generated!");
      setVisible((p) => new Set(p).add(data._id));
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const deleteMut = useMutation({ mutationFn: deleteApiKey, onSuccess: () => { qc.invalidateQueries({ queryKey: ["apiKeys"] }); toast.success("Key deleted"); } });
  const updateMut = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateApiKeyName(id, name),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["apiKeys"] }); setEditingId(null); toast.success("Updated"); },
  });

  const handleCopy = async (key: string, id: string) => {
    await navigator.clipboard.writeText(key);
    setCopiedId(id); toast.success("Copied"); setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVis = (id: string) => setVisible((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">API Keys</h1>
          <p className="text-sm text-text-muted">Manage your API keys for accessing oneAPI</p>
        </div>
        <Button onClick={() => setShowDialog(true)} size="sm"><Plus size={16} /> Create Key</Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : !keys?.length ? (
        <Card className="text-center py-12">
          <Key size={28} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-3">No API keys yet</p>
          <Button onClick={() => setShowDialog(true)} size="sm"><Plus size={14} /> Create your first key</Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key._id} className="group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {editingId === key._id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-7 text-xs w-40" autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") updateMut.mutate({ id: key._id, name: editName }); if (e.key === "Escape") setEditingId(null); }} />
                      <Button size="sm" variant="ghost" onClick={() => updateMut.mutate({ id: key._id, name: editName })}><Check size={14} /></Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-text-primary">{key.name}</span>
                      <button onClick={() => { setEditingId(key._id); setEditName(key.name); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/[0.06] text-text-muted transition-all cursor-pointer"><Pencil size={12} /></button>
                    </>
                  )}
                </div>
                <Badge variant={key.isActive ? "success" : "danger"}>{key.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 text-xs text-text-secondary font-mono bg-surface-primary px-3 py-1.5 rounded-md border border-border-secondary truncate">
                  {visible.has(key._id) ? key.key : maskApiKey(key.key)}
                </code>
                <button onClick={() => toggleVis(key._id)} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer">
                  {visible.has(key._id) ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => handleCopy(key.key, key._id)} className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-white/[0.06] transition-colors cursor-pointer">
                  {copiedId === key._id ? <Check size={14} className="text-accent-emerald" /> : <Copy size={14} />}
                </button>
                <button onClick={() => deleteMut.mutate(key._id)} className="p-1.5 rounded-md text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
              <div className="flex gap-6 text-xs text-text-muted">
                <span>Requests: <span className="text-text-secondary">{key.totalRequests}</span></span>
                <span>Tokens: <span className="text-text-secondary">{formatTokens(key.totalTokensUsed)}</span></span>
                <span>Spent: <span className="text-text-secondary">{formatCurrency(key.totalSpent)}</span></span>
                <span>Last used: <span className="text-text-secondary">{formatRelativeTime(key.lastUsedAt)}</span></span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} title="Create API Key">
        <div className="space-y-4">
          <Input label="Key Name" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="e.g., Development" autoFocus
            onKeyDown={(e) => { if (e.key === "Enter" && newKeyName.trim()) createMut.mutate(newKeyName.trim()); }} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowDialog(false)} size="sm">Cancel</Button>
            <Button onClick={() => createMut.mutate(newKeyName.trim())} disabled={!newKeyName.trim()} loading={createMut.isPending} size="sm">Generate</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
