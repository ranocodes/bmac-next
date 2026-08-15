"use client";

import { useState } from "react";
import Link from "next/link";
import { Send, AlertCircle, CheckCircle, Mail, UserPlus, Eye, EyeOff, Shield, ShieldCheck, RefreshCw } from "lucide-react";
import { createAdminAction, sendCredentialsAction } from "@/actions/admin-auth";
import { useToast } from "@/components/ui/Toast";
import type { Permission } from "@/types/cms";
import { PERMISSION_LABELS } from "@/lib/auth/permissions";

const ALL_PERMISSIONS_LIST: { id: Permission; label: string }[] = PERMISSION_LABELS.map(p => ({ id: p.key, label: p.label }));

interface Props {
  email: string;
}

export default function CreateAdminForm({ email }: Props) {
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [role, setRole] = useState<"super_admin" | "moderator">("moderator");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ email: string; firstName: string; role: "super_admin" | "moderator"; warning?: string } | null>(null);
  const [sending, setSending] = useState(false);

  function togglePermission(p: Permission) {
    setPermissions(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function generatePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 14; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setPassword(pwd);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim()) { setError("Name is required"); return; }
    if (!adminEmail) { setError("Email is required"); return; }
    if (!password) { setError("Password is required"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (role === "moderator" && permissions.length === 0) { setError("Select at least one permission for moderators"); return; }

    setLoading(true);
    try {
      const result = await createAdminAction(email, {
        email: adminEmail,
        firstName: firstName.trim(),
        role,
        permissions: role === "super_admin" ? [] : permissions,
        password,
      });
      if (result.error) { setError(result.error); setLoading(false); return; }
      setCreated({ email: adminEmail, firstName: firstName.trim(), role, warning: result.warning });
      if (result.warning) {
        toast("Admin created, but the email failed to send. Resend below.", "error");
      } else {
        toast("Admin created", "success");
      }
      setLoading(false);
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  async function resendCredentials() {
    if (!created) return;
    setSending(true);
    try {
      const result = await sendCredentialsAction({
        email: created.email,
        firstName: created.firstName,
        password,
        role: created.role,
      });
      if (result.error) { toast(result.error, "error"); setSending(false); return; }
      toast("Credentials sent to " + created.email, "success");
      setSending(false);
    } catch {
      toast("Something went wrong. Try again.", "error");
      setSending(false);
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <UserPlus size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">New Admin</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Create an administrator account</p>
        </div>
      </div>

      {created ? (
        <div className="max-w-md p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <div className="flex items-center gap-2.5 text-emerald-600 text-sm font-medium mb-3">
            <CheckCircle size={16} />
            <span>Admin account created</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            {created.firstName} can now sign in at{" "}
            <Link href="/admin/login" className="text-primary hover:text-primary/80 font-medium">/admin/login</Link> with the
            password you set. Credentials were emailed to{" "}
            <span className="text-secondary font-medium">{created.email}</span>.
          </p>
          {created.warning && (
            <div className="flex items-center gap-2.5 px-4 py-3 mb-4 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{created.warning}</span>
            </div>
          )}
          <button onClick={resendCredentials} disabled={sending}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {sending ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><RefreshCw size={16} /> Email Credentials</>}
          </button>
          <Link href="/admin/admins" className="mt-3 block w-full h-10 flex items-center justify-center rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
            Back to Admins
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left max-w-md">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full h-11 px-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                placeholder="newadmin@example.org"
                className="w-full h-11 pl-11 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setRole("moderator")}
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium transition-all ${role === "moderator" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:text-secondary"}`}>
                <Shield size={16} /> Moderator
              </button>
              <button type="button" onClick={() => setRole("super_admin")}
                className={`flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium transition-all ${role === "super_admin" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card text-muted-foreground hover:text-secondary"}`}>
                <ShieldCheck size={16} /> Super Admin
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Password</label>
            <div className="relative">
              <input type={showPwd ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full h-11 px-4 pr-20 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button type="button" onClick={generatePassword}
                  className="text-xs text-primary hover:text-primary/80 font-medium">Generate</button>
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="text-muted-foreground hover:text-secondary">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {role === "moderator" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">Permissions</label>
              <div className="space-y-1.5">
                {ALL_PERMISSIONS_LIST.map(p => (
                  <label key={p.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                    <input type="checkbox" checked={permissions.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20" />
                    <span className="text-sm text-secondary">{p.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Send size={16} /> Create Admin</>}
          </button>
        </form>
      )}
    </div>
  );
}
