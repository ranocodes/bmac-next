"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { executePasswordReset } from "@/actions/admin-auth";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }

    setLoading(true);
    try {
      const result = await executePasswordReset(token, password);
      if (result.error) { setError(result.error); return; }
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-2">Password reset</h1>
          <p className="text-sm text-muted-foreground mb-6">Your password has been updated.</p>
          <button onClick={() => router.push("/admin/login")}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-2">Must be at least 8 characters.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">New password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Confirm password</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <SubmitButton pending={loading}>Reset password</SubmitButton>
        </form>
      </div>
    </div>
  );
}
