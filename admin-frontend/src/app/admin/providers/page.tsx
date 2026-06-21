"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "@/lib/api/admin";
import type { Provider } from "@/types";
import { Plus, Pencil, Trash2, Globe, X } from "lucide-react";
import { toast } from "sonner";

function ProviderModal({
  provider,
  onClose,
  onSave,
}: {
  provider?: Provider;
  onClose: () => void;
  onSave: (d: { name: string; slug: string }) => void;
}) {
  const [name, setName] = useState(provider?.name || "");
  const [slug, setSlug] = useState(provider?.slug || "");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-border-primary bg-bg-card p-6 animate-slide-up"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-text-primary">
            {provider ? "Edit" : "Create"} Provider
          </h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="OpenAI"
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-border-active"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="openai"
              className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm text-text-primary focus:outline-none focus:border-border-active"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:text-text-primary cursor-pointer">
            Cancel
          </button>
          <button
            onClick={() => {
              if (name && slug) onSave({ name, slug });
            }}
            className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 cursor-pointer"
            disabled={!name || !slug}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProvidersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing?: Provider }>({
    open: false,
  });
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data: providers, isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
    retry: false,
  });

  const createMut = useMutation({
    mutationFn: (d: { name: string; slug: string }) => createProvider(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      setModal({ open: false });
      toast.success("Provider created");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{ name: string; slug: string }>;
    }) => updateProvider(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      setModal({ open: false });
      toast.success("Provider updated");
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: deleteProvider,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["providers"] });
      setDeleting(null);
      toast.success("Provider deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Providers</h1>
          <p className="text-sm text-text-muted">Manage AI providers</p>
        </div>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 cursor-pointer">
          <Plus size={14} />
          Add Provider
        </button>
      </div>
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-bg-card border border-border-primary animate-pulse"
            />
          ))}
        </div>
      ) : !providers || providers.length === 0 ? (
        <div className="text-center py-16 text-text-muted text-sm">
          No providers yet. Add your first provider.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {providers.map((p: Provider) => (
            <div
              key={p._id}
              className="rounded-xl border border-border-primary bg-bg-card p-4 hover:border-border-active transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                    <Globe size={14} className="text-accent-blue" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-text-muted font-mono">
                      {p.slug}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${p.isActive ? "bg-accent-emerald/10 text-accent-emerald" : "bg-accent-rose/10 text-accent-rose"}`}>
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setModal({ open: true, editing: p })}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.04] cursor-pointer">
                  <Pencil size={11} />
                  Edit
                </button>
                {deleting === p._id ? (
                  <>
                    <button
                      onClick={() => deleteMut.mutate(p._id)}
                      className="px-2 py-1 rounded text-[11px] text-accent-rose hover:bg-accent-rose/10 cursor-pointer">
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeleting(null)}
                      className="px-2 py-1 rounded text-[11px] text-text-muted cursor-pointer">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setDeleting(p._id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 cursor-pointer">
                    <Trash2 size={11} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {modal.open && (
        <ProviderModal
          provider={modal.editing}
          onClose={() => setModal({ open: false })}
          onSave={(d) =>
            modal.editing
              ? updateMut.mutate({ id: modal.editing._id, data: d })
              : createMut.mutate(d)
          }
        />
      )}
    </div>
  );
}
