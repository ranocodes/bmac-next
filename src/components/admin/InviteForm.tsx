"use client";

import { useState } from "react";
import { Send, AlertCircle, CheckCircle, Copy, Mail, UserPlus } from "lucide-react";
import { createInviteAction } from "@/actions/admin-auth";

interface Props {
  email: string;
}

export default function InviteForm({ email }: Props) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInviteUrl("");

    if (!inviteEmail) { setError("Email is required"); return; }

    setLoading(true);
    try {
      const result = await createInviteAction(inviteEmail, email);
      if (result.error) { setError(result.error); setLoading(false); return; }
      if (result.token) {
        setInviteUrl(`${window.location.origin}/admin/invite/${result.token}`);
      }
      setInviteEmail("");
      setLoading(false);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
    } catch { /* fallback */ }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserPlus size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Invite Admin</h1>
          <p className="text-sm text-muted-foreground mt-2">Send an invite to add a super administrator</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Invite email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="newadmin@example.org"
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
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
              : <><Send size={16} /> Create Invite</>}
          </button>
        </form>

        {inviteUrl && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-left">
            <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium mb-3">
              <CheckCircle size={16} />
              <span>Invite created</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-muted-foreground bg-card px-3 py-2 rounded-lg truncate">{inviteUrl}</code>
              <button onClick={copyLink}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-card hover:bg-border transition-colors text-muted-foreground hover:text-secondary">
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          <a href="/admin/admins" className="text-primary hover:text-primary/80 font-medium">Back to admins</a>
        </p>
      </div>
    </div>
  );
}