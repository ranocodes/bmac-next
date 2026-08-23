"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/admin-auth";
import Link from "next/link";
import { Shield, AlertCircle, CheckCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email) { setError("Email is required"); return; }

    setLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (result.error) { setError(result.error); return; }
      setSent(true);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-2">Check your email</h1>
          <p className="text-sm text-muted-foreground mb-6">If an account exists with that email, we've sent a password reset link. It expires in 1 hour.</p>
          <Link href="/admin/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            Back to login
          </Link>
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
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-2">Enter your admin email and we'll send you a reset link.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.org"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <SubmitButton pending={loading}>Send reset link</SubmitButton>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          <Link href="/admin/login" className="text-primary hover:text-primary/80 font-medium">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
