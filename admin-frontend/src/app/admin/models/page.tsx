"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getModels,
  createModel,
  updateModel,
  deleteModel,
  getProviders,
  getBillings,
} from "@/lib/api/admin";
import type { Model, Provider, Billing } from "@/types";
import { Plus, Pencil, Trash2, Layers, X } from "lucide-react";
import { toast } from "sonner";

type MForm = { name: string; slug: string; provider: string; billing: string };

function Modal({
  m,
  providers,
  billings,
  onClose,
  onSave,
}: {
  m?: Model;
  providers: Provider[];
  billings: Billing[];
  onClose: () => void;
  onSave: (d: MForm) => void;
}) {
  const [f, setF] = useState<MForm>({
    name: m?.name || "",
    slug: m?.slug || "",
    provider:
      typeof m?.provider === "object" ? m.provider._id : m?.provider || "",
    billing: typeof m?.billing === "object" ? m.billing._id : m?.billing || "",
  });
  const valid = f.name && f.slug && f.provider && f.billing;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border-primary bg-bg-card p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">
            {m ? "Edit" : "Create"} Model
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Name
            </label>
            <input
              value={f.name}
              onChange={(e) => setF((p) => ({ ...p, name: e.target.value }))}
              placeholder="GPT-4o Mini"
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Slug
            </label>
            <input
              value={f.slug}
              onChange={(e) => setF((p) => ({ ...p, slug: e.target.value }))}
              placeholder="gpt-4o-mini"
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active"
            />
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Provider
            </label>
            <select
              value={f.provider}
              onChange={(e) =>
                setF((p) => ({ ...p, provider: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active">
              <option value="">Select provider</option>
              {providers.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">
              Pricing
            </label>
            <select
              value={f.billing}
              onChange={(e) => setF((p) => ({ ...p, billing: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active">
              <option value="">Select pricing</option>
              {billings.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({b.currency})
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-text-secondary cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => valid && onSave(f)}
            disabled={!valid}
            className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing?: Model }>({
    open: false,
  });
  const [del, setDel] = useState<string | null>(null);

  const { data: modelsRes, isLoading } = useQuery({
    queryKey: ["models"],
    queryFn: () => getModels(1, "all"),
    retry: false,
  });
  const { data: providers } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
    retry: false,
  });
  const { data: billings } = useQuery({
    queryKey: ["billings"],
    queryFn: getBillings,
    retry: false,
  });

  const models = modelsRes?.data || [];

  const cMut = useMutation({
    mutationFn: (d: MForm) => createModel(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
      setModal({ open: false });
      toast.success("Model created");
    },
    onError: (e) => toast.error(e.message),
  });
  const uMut = useMutation({
    mutationFn: ({ id, d }: { id: string; d: Partial<MForm> }) =>
      updateModel(id, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
      setModal({ open: false });
      toast.success("Model updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const dMut = useMutation({
    mutationFn: deleteModel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["models"] });
      setDel(null);
      toast.success("Model deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Models</h1>
          <p className="text-sm text-text-muted">Manage AI models</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 cursor-pointer">
          <Plus size={14} />
          Add Model
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-bg-card border border-border-primary animate-pulse"
            />
          ))}
        </div>
      ) : !models.length ? (
        <div className="text-center py-16 text-text-muted text-sm">
          No models yet. Create providers and pricing first, then add models.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border-primary bg-bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-primary text-text-muted text-xs">
                <th className="text-left py-3 px-4">Model</th>
                <th className="text-left py-3 px-4">Slug</th>
                <th className="text-left py-3 px-4">Provider</th>
                <th className="text-left py-3 px-4">Input/1K</th>
                <th className="text-left py-3 px-4">Output/1K</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m: Model) => {
                const prov = typeof m.provider === "object" ? m.provider : null;
                const bill = typeof m.billing === "object" ? m.billing : null;
                return (
                  <tr
                    key={m._id}
                    className="border-b border-border-primary/50 hover:bg-white/[0.02] group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center">
                          <Layers size={12} className="text-brand-400" />
                        </div>
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono text-xs">
                      {m.slug}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-1.5 py-0.5 rounded bg-accent-blue/10 text-accent-blue text-[10px] font-medium">
                        {prov?.name || "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono text-xs">
                      {bill?.inputCostPer1KTokens ?? "—"}
                    </td>
                    <td className="py-3 px-4 text-text-secondary font-mono text-xs">
                      {bill?.outputCostPer1KTokens ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${m.isActive ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose"}`}>
                        {m.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModal({ open: true, editing: m })}
                          className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.04] cursor-pointer">
                          <Pencil size={12} />
                        </button>
                        {del === m._id ? (
                          <>
                            <button
                              onClick={() => dMut.mutate(m._id)}
                              className="px-2 py-1 rounded text-[11px] text-accent-rose cursor-pointer">
                              Confirm
                            </button>
                            <button
                              onClick={() => setDel(null)}
                              className="px-2 py-1 text-[11px] text-text-muted cursor-pointer">
                              ×
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setDel(m._id)}
                            className="p-1.5 rounded text-text-muted hover:text-accent-rose cursor-pointer">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && providers && billings && (
        <Modal
          m={modal.editing}
          providers={providers}
          billings={billings}
          onClose={() => setModal({ open: false })}
          onSave={(d) =>
            modal.editing
              ? uMut.mutate({ id: modal.editing._id, d })
              : cMut.mutate(d)
          }
        />
      )}
    </div>
  );
}
