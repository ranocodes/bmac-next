"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle, UserCheck } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { getInviteByCode, acceptInviteAction } from "@/actions/invitations";
import { useToast } from "@/components/ui/Toast";

export default function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");
  const { toast } = useToast();
  const clerk = useClerk();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [invitePerms, setInvitePerms] = useState<string[]>([]);

  useEffect(() => {
    if (!code) return;
    fetchInvite(code);
  }, [code]);

  async function fetchInvite(inviteCode: string) {
    const invite = await getInviteByCode(inviteCode);
    if (invite) {
      if (invite.email) setEmail(invite.email);
      if (invite.role) setInviteRole(invite.role);
      if (invite.permissions) setInvitePerms(invite.permissions);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !email || !password) { setError("All fields required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!code) { setError("Invalid invite code"); return; }

    setLoading(true);
    try {
      const signUpAttempt = await clerk.client.signUp.create({
        emailAddress: email,
        password,
        firstName,
      });

      if (signUpAttempt.status !== "complete") {
        setError("Email verification required. Check your inbox.");
        setLoading(false);
        return;
      }

      if (!signUpAttempt.createdSessionId) {
        setError("Failed to create session. Please sign in.");
        setLoading(false);
        return;
      }

      await clerk.setActive({ session: signUpAttempt.createdSessionId });

      const role = inviteRole || "administrator";
      const perms = invitePerms.length > 0 ? invitePerms : role === "administrator"
        ? ["manage_users", "edit_content", "manage_courses", "manage_partners", "view_analytics", "access_settings", "delete_records", "manage_moderators"]
        : ["edit_content", "manage_courses", "manage_partners", "view_analytics"];

      const result = await acceptInviteAction({ code, email, firstName, password, role, permissions: perms });
      if (result?.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      toast("Account created! Welcome.", "success");
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserCheck size={28} className="text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Join BMAC<span className="text-primary">.</span></h1>
          <p className="text-sm text-muted-foreground mt-2">Create your admin account</p>
          {inviteRole && <p className="text-xs text-muted-foreground/60 mt-1">Invited as <span className="font-medium capitalize text-secondary">{inviteRole}</span></p>}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Full Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane Doe"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.org"
              className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-secondary">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
              : <><LogIn size={16} /> Create Account</>}
          </button>
        </form>
      </div>
    </div>
  );
}
