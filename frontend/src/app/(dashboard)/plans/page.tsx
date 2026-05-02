"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlans } from "@/lib/api/plans";
import { getSubscription, createSubscription } from "@/lib/api/subscription";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils/format";
import { Check, Zap } from "lucide-react";
import { toast } from "sonner";

export default function PlansPage() {
  const qc = useQueryClient();
  const { data: plans, isLoading } = useQuery({ queryKey: ["plans"], queryFn: getPlans });
  const { data: sub } = useQuery({ queryKey: ["subscription"], queryFn: getSubscription, retry: false });

  const subscribeMut = useMutation({
    mutationFn: (planId: string) => createSubscription(planId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["subscription"] }); toast.success("Subscribed!"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to subscribe"),
  });

  const currentPlanId = sub?.plan?._id;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Plans</h1>
        <p className="text-sm text-text-muted">Choose a plan that fits your needs</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : !plans?.length ? (
        <Card className="text-center py-12"><p className="text-sm text-text-muted">No plans available</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = plan._id === currentPlanId;
            return (
              <Card key={plan._id} className={`flex flex-col ${isCurrent ? "border-brand-500/50 ring-1 ring-brand-500/20" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-text-primary">{plan.name}</h3>
                  {isCurrent && <Badge variant="success">Current</Badge>}
                </div>
                <p className="text-2xl font-bold text-text-primary mb-1">
                  {formatCurrency(plan.price)}<span className="text-sm text-text-muted font-normal">/mo</span>
                </p>
                <div className="mt-4 space-y-2 flex-1">
                  {plan.features?.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                      <Check size={12} className="text-accent-emerald shrink-0" /> {f}
                    </div>
                  ))}
                  <div className="pt-2 space-y-1 text-[11px] text-text-muted">
                    <p>↳ {plan.limits.requestsPerDay.toLocaleString()} req/day</p>
                    <p>↳ {plan.limits.tokensPerDay.toLocaleString()} tokens/day</p>
                    <p>↳ {plan.limits.requestsPerMinute} req/min</p>
                  </div>
                </div>
                <Button
                  variant={isCurrent ? "secondary" : "primary"}
                  className="w-full mt-4"
                  size="sm"
                  disabled={isCurrent}
                  loading={subscribeMut.isPending}
                  onClick={() => subscribeMut.mutate(plan._id)}
                >
                  {isCurrent ? "Current Plan" : "Subscribe"}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
