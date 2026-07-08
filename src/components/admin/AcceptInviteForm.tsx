"use client";

import { useState } from "react";
import { Eye, EyeOff, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { acceptInviteAction } from "@/actions/admin-auth";

interface Props {
  token: string;
  email: string;
  firstName: string;
}

export default function AcceptInviteForm({ token, email, firstName: initialFirstName }: Props) {
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [showTemp, setShowTemp] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!tempPassword) { setError("Temporary password is required"); return; }
    if (!newPassword) { setError("New password is required"); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (newPassword !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const result = await acceptInviteAction(token, tempPassword, newPassword, firstName.trim());
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary mb-2">Account created</h1>
          <p className="text-sm text-muted-foreground mb-6">You are now logged in as admin.</p>
          <a href="/admin"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
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
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Accept Invite</h1>
          <p className="text-sm text-muted-foreground mt-2">Welcome{initialFirstName ? `, ${initialFirstName}` : ""}! Set up your admin account for <span className="text-secondary font-medium">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Temporary password</label>
            <div className="relative">
              <input type={showTemp ? "text" : "password"} value={tempPassword} onChange={e => setTempPassword(e.target.value)}
                placeholder="Provided by inviter"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShowTemp(!showTemp)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {showTemp ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">New password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Confirm new password</label>
            <input type={showNew ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Display name <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Shield size={16} /> Create Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}