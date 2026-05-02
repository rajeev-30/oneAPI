"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "@/lib/api/auth";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { UserIcon } from "lucide-react";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name || "");

  const mutation = useMutation({
    mutationFn: (data: { name: string }) => updateUser(data),
    onSuccess: (u) => { dispatch(setUser(u)); toast.success("Profile updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6 animate-fade-in">
      <div><h1 className="text-lg font-semibold text-text-primary">Settings</h1><p className="text-sm text-text-muted">Manage your profile</p></div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><UserIcon size={16} className="text-brand-400" /> Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name }); }} className="space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input label="Email" value={user?.email || ""} disabled />
            <Button type="submit" loading={mutation.isPending} size="sm">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
