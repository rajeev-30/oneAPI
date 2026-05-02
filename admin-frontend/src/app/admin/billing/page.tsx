"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBillings, createBilling, updateBilling, deleteBilling } from "@/lib/api/admin";
import type { Billing } from "@/types";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

type BForm = { name: string; input: string; output: string; currency: "INR" | "USD" };

function Modal({ b, onClose, onSave }: { b?: Billing; onClose: () => void; onSave: (d: BForm) => void }) {
  const [f, setF] = useState<BForm>({ name: b?.name || "", input: b?.inputCostPer1KTokens?.toString() || "", output: b?.outputCostPer1KTokens?.toString() || "", currency: b?.currency || "INR" });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-border-primary bg-bg-card p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5"><h2 className="text-base font-semibold">{b ? "Edit" : "Create"} Pricing</h2><button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer"><X size={16} /></button></div>
        <div className="space-y-3">
          <div><label className="block text-xs text-text-secondary mb-1">Name</label><input value={f.name} onChange={e => setF(p => ({...p, name: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-text-secondary mb-1">Input/1K</label><input type="number" step="0.001" value={f.input} onChange={e => setF(p => ({...p, input: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
            <div><label className="block text-xs text-text-secondary mb-1">Output/1K</label><input type="number" step="0.001" value={f.output} onChange={e => setF(p => ({...p, output: e.target.value}))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active" /></div>
          </div>
          <div><label className="block text-xs text-text-secondary mb-1">Currency</label><select value={f.currency} onChange={e => setF(p => ({...p, currency: e.target.value as "INR"|"USD"}))} className="w-full px-3 py-2 rounded-lg border border-border-primary bg-bg-secondary text-sm focus:outline-none focus:border-border-active"><option value="INR">INR</option><option value="USD">USD</option></select></div>
        </div>
        <div className="flex justify-end gap-2 mt-5"><button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-text-secondary cursor-pointer">Cancel</button><button onClick={() => f.name && f.input && f.output && onSave(f)} disabled={!f.name||!f.input||!f.output} className="px-4 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 disabled:opacity-50 cursor-pointer">Save</button></div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<{open:boolean;editing?:Billing}>({open:false});
  const [del, setDel] = useState<string|null>(null);
  const {data:billings,isLoading} = useQuery({queryKey:["billings"],queryFn:getBillings,retry:false});
  const cMut = useMutation({mutationFn:(d:BForm) => createBilling({name:d.name,inputCostPer1KTokens:+d.input,outputCostPer1KTokens:+d.output,currency:d.currency}),onSuccess:()=>{qc.invalidateQueries({queryKey:["billings"]});setModal({open:false});toast.success("Created")},onError:e=>toast.error(e.message)});
  const uMut = useMutation({mutationFn:({id,d}:{id:string;d:BForm}) => updateBilling(id,{name:d.name,inputCostPer1KTokens:+d.input,outputCostPer1KTokens:+d.output,currency:d.currency}),onSuccess:()=>{qc.invalidateQueries({queryKey:["billings"]});setModal({open:false});toast.success("Updated")},onError:e=>toast.error(e.message)});
  const dMut = useMutation({mutationFn:deleteBilling,onSuccess:()=>{qc.invalidateQueries({queryKey:["billings"]});setDel(null);toast.success("Deleted")},onError:e=>toast.error(e.message)});

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between"><div><h1 className="text-lg font-semibold">Model Pricing</h1><p className="text-sm text-text-muted">Token-based pricing configs</p></div><button onClick={()=>setModal({open:true})} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 cursor-pointer"><Plus size={14}/>Add</button></div>
      {isLoading ? <div className="space-y-3">{[...Array(3)].map((_,i)=><div key={i} className="h-14 rounded-xl bg-bg-card border border-border-primary animate-pulse"/>)}</div> : !billings?.length ? <div className="text-center py-16 text-text-muted text-sm">No pricing configs yet.</div> : (
        <div className="overflow-x-auto rounded-xl border border-border-primary bg-bg-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border-primary text-text-muted text-xs"><th className="text-left py-3 px-4">Name</th><th className="text-left py-3 px-4">Input/1K</th><th className="text-left py-3 px-4">Output/1K</th><th className="text-left py-3 px-4">Currency</th><th className="text-right py-3 px-4">Actions</th></tr></thead>
            <tbody>{billings.map((b:Billing)=>(
              <tr key={b._id} className="border-b border-border-primary/50 hover:bg-white/[0.02] group">
                <td className="py-3 px-4 font-medium">{b.name}</td>
                <td className="py-3 px-4 text-text-secondary font-mono">{b.inputCostPer1KTokens}</td>
                <td className="py-3 px-4 text-text-secondary font-mono">{b.outputCostPer1KTokens}</td>
                <td className="py-3 px-4"><span className="px-1.5 py-0.5 rounded bg-accent-amber/10 text-accent-amber text-[10px] font-medium">{b.currency}</span></td>
                <td className="py-3 px-4 text-right"><div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>setModal({open:true,editing:b})} className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-white/[0.04] cursor-pointer"><Pencil size={12}/></button>
                  {del===b._id?<><button onClick={()=>dMut.mutate(b._id)} className="px-2 py-1 rounded text-[11px] text-accent-rose cursor-pointer">Confirm</button><button onClick={()=>setDel(null)} className="px-2 py-1 text-[11px] text-text-muted cursor-pointer">×</button></>:<button onClick={()=>setDel(b._id)} className="p-1.5 rounded text-text-muted hover:text-accent-rose cursor-pointer"><Trash2 size={12}/></button>}
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {modal.open && <Modal b={modal.editing} onClose={()=>setModal({open:false})} onSave={d=>modal.editing?uMut.mutate({id:modal.editing._id,d}):cMut.mutate(d)}/>}
    </div>
  );
}
