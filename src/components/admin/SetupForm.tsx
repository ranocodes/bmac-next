"use client";

import { useState } from "react";
import { Shield, UserPlus, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { registerFirstAdminAction } from "@/actions/admin-auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function SetupForm() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) { setError("Name is required"); return; }
    if (!email || !password) { setError("Email and password required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const result = await registerFirstAdminAction(email, password, firstName.trim());
      if (result.error) { setError(result.error); setLoading(false); return; }
      setDone(true);
    } catch {
      setError("Something went wrong. Try again.");
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-2">Super admin created</h1>
          <p className="text-sm text-muted-foreground mb-6">You are now logged in.</p>
          <a href="/admin"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            Go to dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center mx-auto mb-4">
            <UserPlus size={18} />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Create Super Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Set up the initial administrator account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.org"
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 pr-11 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Confirm password</label>
            <input type={show ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <SubmitButton pending={loading} className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            <Shield size={16} /> Create Super Admin
          </SubmitButton>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          <a href="/admin/login" className="text-primary hover:text-primary/80 font-medium">Back to login</a>
        </p>
      </div>
    </div>
  );
}