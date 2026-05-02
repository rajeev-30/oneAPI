"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlans, createPlan, updatePlan, deletePlan } from "@/lib/api/admin";
import type { Plan } from "@/types";
import { Plus, Pencil, Trash2, X, Zap } from "lucide-react";
import { toast } from "sonner";

type PForm = { name: string; price: string; rpd: string; tpd: string; rpm: string; tpm: string; features: string };

function Modal({ p, onClose, onSave }: { p?: Plan; onClose: () => void; onSave: (d: PForm) => void }) {
  const [f, setF] = useState<PForm>({
    name: p?.name || "", price: p?.price?.toString() || "",
    rpd: p?.limits?.requestsPerDay?.toString() || "", tpd: p?.limits?.tokensPerDay?.toString() || "",
    rpm: p?.limits?.requestsPerMinute?.toString() || "", tpm: p?.limits?.tokensPerMinute?.toString() || "",
    features: p?.features?.join(", ") || "",
  });
  const valid = f.name && f.price;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-border-primary bg-bg-card p-6 animate-slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">{p ? "Edit" : "Create"} Plan</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer"><X size={16} /></button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-text-secondary mb-1">Name</label><input value={f.name} onChange={e => setF(q => ({ ...q, name: e.target.value }))} placeholder="Pro" className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
            <div><label className="block text-xs text-text-secondary mb-1">Price (₹)</label><input type="number" value={f.price} onChange={e => setF(q => ({ ...q, price: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
          </div>
          <p className="text-xs text-text-muted font-medium mt-2">Rate Limits</p>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-text-secondary mb-1">Requests/Day</label><input type="number" value={f.rpd} onChange={e => setF(q => ({ ...q, rpd: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
            <div><label className="block text-xs text-text-secondary mb-1">Tokens/Day</label><input type="number" value={f.tpd} onChange={e => setF(q => ({ ...q, tpd: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
            <div><label className="block text-xs text-text-secondary mb-1">Requests/Min</label><input type="number" value={f.rpm} onChange={e => setF(q => ({ ...q, rpm: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
            <div><label className="block text-xs text-text-secondary mb-1">Tokens/Min</label><input type="number" value={f.tpm} onChange={e => setF(q => ({ ...q, tpm: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
          </div>
          <div><label className="block text-xs text-text-secondary mb-1">Features (comma separated)</label><input value={f.features} onChange={e => setF(q => ({ ...q, features: e.target.value }))} placeholder="Priority support, Advanced models" className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-text-secondary cursor-pointer">Cancel</button>
          <button onClick={() => valid && onSave(f)} disabled={!valid} className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 cursor-pointer">Save</button>
        </div>
      </div>
    </div>
  );
}

function formToPayload(d: PForm) {
  return {
    name: d.name, price: +d.price,
    limits: { requestsPerDay: +d.rpd || 0, tokensPerDay: +d.tpd || 0, requestsPerMinute: +d.rpm || 0, tokensPerMinute: +d.tpm || 0 },
    features: d.features ? d.features.split(",").map(s => s.trim()).filter(Boolean) : undefined,
  };
}

export default function PlansPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; editing?: Plan }>({ open: false });
  const [del, setDel] = useState<string | null>(null);
  const { data: plans, isLoading } = useQuery({ queryKey: ["plans"], queryFn: getPlans, retry: false });

  const cMut = useMutation({ mutationFn: (d: PForm) => createPlan(formToPayload(d)), onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); setModal({ open: false }); toast.success("Plan created"); }, onError: e => toast.error(e.message) });
  const uMut = useMutation({ mutationFn: ({ id, d }: { id: string; d: PForm }) => updatePlan(id, formToPayload(d)), onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); setModal({ open: false }); toast.success("Plan updated"); }, onError: e => toast.error(e.message) });
  const dMut = useMutation({ mutationFn: deletePlan, onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); setDel(null); toast.success("Plan deleted"); }, onError: e => toast.error(e.message) });

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold">Plans</h1><p className="text-sm text-text-muted">Subscription plans & rate limits</p></div>
        <button onClick={() => setModal({ open: true })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 cursor-pointer"><Plus size={14} />Add Plan</button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-bg-card border border-border-primary animate-pulse" />)}</div>
      ) : !plans?.length ? (
        <div className="text-center py-16 text-text-muted text-sm">No plans yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p: Plan) => (
            <div key={p._id} className="rounded-xl border border-border-primary bg-bg-card p-5 hover:border-border-active transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-accent-violet/10 flex items-center justify-center"><Zap size={14} className="text-accent-violet" /></div>
                  <div><p className="text-sm font-semibold">{p.name}</p><p className="text-lg font-bold gradient-text">₹{p.price}<span className="text-xs text-text-muted font-normal">/mo</span></p></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="px-2 py-1.5 rounded-lg bg-bg-secondary"><p className="text-[10px] text-text-muted">Req/Day</p><p className="text-xs font-mono font-medium">{p.limits?.requestsPerDay?.toLocaleString() || 0}</p></div>
                <div className="px-2 py-1.5 rounded-lg bg-bg-secondary"><p className="text-[10px] text-text-muted">Tok/Day</p><p className="text-xs font-mono font-medium">{p.limits?.tokensPerDay?.toLocaleString() || 0}</p></div>
                <div className="px-2 py-1.5 rounded-lg bg-bg-secondary"><p className="text-[10px] text-text-muted">Req/Min</p><p className="text-xs font-mono font-medium">{p.limits?.requestsPerMinute || 0}</p></div>
                <div className="px-2 py-1.5 rounded-lg bg-bg-secondary"><p className="text-[10px] text-text-muted">Tok/Min</p><p className="text-xs font-mono font-medium">{p.limits?.tokensPerMinute?.toLocaleString() || 0}</p></div>
              </div>

              {p.features?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.features.map((f, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 text-[10px]">{f}</span>)}
                </div>
              )}

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal({ open: true, editing: p })} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-text-muted hover:text-text-primary hover:bg-white/[0.04] cursor-pointer"><Pencil size={11} />Edit</button>
                {del === p._id ? (
                  <><button onClick={() => dMut.mutate(p._id)} className="px-2 py-1 rounded text-[11px] text-accent-rose cursor-pointer">Confirm</button><button onClick={() => setDel(null)} className="px-2 py-1 text-[11px] text-text-muted cursor-pointer">Cancel</button></>
                ) : (
                  <button onClick={() => setDel(p._id)} className="flex items-center gap-1 px-2 py-1 rounded text-[11px] text-text-muted hover:text-accent-rose cursor-pointer"><Trash2 size={11} />Delete</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && <Modal p={modal.editing} onClose={() => setModal({ open: false })} onSave={d => modal.editing ? uMut.mutate({ id: modal.editing._id, d }) : cMut.mutate(d)} />}
    </div>
  );
}
