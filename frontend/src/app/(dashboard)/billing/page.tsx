"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWallet, addBalance } from "@/lib/api/wallet";
import { getSubscription } from "@/lib/api/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Wallet, Plus, Shield } from "lucide-react";
import { toast } from "sonner";
import { MINIMUM_TOPUP_AMOUNT } from "@/lib/utils/constants";

export default function BillingPage() {
  const qc = useQueryClient();
  const [showTopup, setShowTopup] = useState(false);
  const [amount, setAmount] = useState("");

  const { data: wallet, isLoading: wLoad } = useQuery({ queryKey: ["wallet"], queryFn: getWallet, retry: false });
  const { data: sub, isLoading: sLoad } = useQuery({ queryKey: ["subscription"], queryFn: getSubscription, retry: false });

  const topup = useMutation({
    mutationFn: (a: number) => addBalance(a),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
      setShowTopup(false);
      setAmount("");
      toast.success("Credits have been added!");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Credits top-up failed"),
  });

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-semibold text-text-primary">Credits</h1><p className="text-sm text-text-muted">Manage your wallet and billing</p></div>

      {wLoad ? <Skeleton className="h-40 rounded-xl" /> : (
        <Card className="bg-gradient-to-br from-brand-900/50 to-brand-800/30 border-brand-700/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-base text-text-muted mb-1">Available Balance</p>
              <p className="text-3xl font-bold text-text-primary">{formatCurrency(wallet?.balance ?? 0)}</p>
              <p className="text-sm text-text-muted mt-2">Total spent: {formatCurrency(wallet?.totalSpent ?? 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center"><Wallet size={24} className="text-brand-400" /></div>
          </div>
          <div className="mt-4"><Button onClick={() => setShowTopup(true)} size="md"><Plus size={16} /> Add Credits</Button></div>
        </Card>
      )}

      {sLoad ? <Skeleton className="h-32 rounded-xl" /> : sub ? (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield size={16} className="text-brand-400" /> Subscription</CardTitle><Badge variant={sub.status === "active" ? "success" : "danger"}>{sub.status}</Badge></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {sub.plan && (<><div><p className="text-text-muted text-xs">Plan</p><p className="text-text-primary font-bold text-base">{sub.plan.name}</p></div><div><p className="text-text-muted text-xs">Price</p><p className="text-text-primary font-bold text-base">{formatCurrency(sub.plan.price)}/mo</p></div></>)}
              <div><p className="text-text-muted text-xs">Start</p><p className="text-text-primary text-base">{formatDate(sub.startDate)}</p></div>
              <div><p className="text-text-muted text-xs">End</p><p className="text-text-primary text-base">{formatDate(sub.endDate)}</p></div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={showTopup} onClose={() => setShowTopup(false)} title="Add Credits">
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {[50, 100, 500, 1000].map((a) => (
              <button key={a} onClick={() => setAmount(String(a))} className={`py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${amount === String(a) ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-border-primary text-text-secondary hover:border-border-active"}`}>₹{a}</button>
            ))}
          </div>
          <Input label="Custom Amount (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" min={2} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => setShowTopup(false)} size="sm">Cancel</Button>
            <Button onClick={() => topup.mutate(Number(amount))} disabled={!amount || Number(amount) < MINIMUM_TOPUP_AMOUNT} loading={topup.isPending} size="sm">Add ₹{amount || "0"}</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
