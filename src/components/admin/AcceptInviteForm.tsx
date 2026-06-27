"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle, UserCheck, ArrowRight, KeyRound } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { getInviteByCode, acceptInviteAction, acceptExistingUserInvite, validateInviteCode } from "@/actions/invitations";
import { useToast } from "@/components/ui/Toast";

export default function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const codeFromUrl = searchParams.get("code");
  const { toast } = useToast();
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();

  const [step, setStep] = useState<"code" | "form">(codeFromUrl ? "form" : "code");
  const [inviteCode, setInviteCode] = useState(codeFromUrl || "");
  const [validating, setValidating] = useState(!!codeFromUrl);
  const [validationError, setValidationError] = useState("");
  const [inviteData, setInviteData] = useState<any>(null);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codeFromUrl) doValidate(codeFromUrl);
  }, [codeFromUrl]);

  async function doValidate(code: string) {
    setValidating(true);
    setValidationError("");
    try {
      const result = await validateInviteCode(code);
      if (result.error) {
        setValidationError(result.error);
        setValidating(false);
        return;
      }
      setInviteCode(code);
      setInviteData(result.invite);
      if (result.invite.email) setEmail(result.invite.email);
      setStep("form");
    } catch {
      setValidationError("Failed to validate code. Try again.");
    }
    setValidating(false);
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setValidationError("Enter your invitation code");
      return;
    }
    await doValidate(inviteCode.trim());
  }

  async function handleAcceptExisting() {
    if (!inviteCode || !email) return;
    setLoading(true);
    setError("");

    const role = inviteData?.role || "administrator";
    const perms = inviteData?.permissions?.length > 0 ? inviteData.permissions : role === "administrator"
      ? ["manage_users", "edit_content", "manage_courses", "manage_partners", "view_analytics", "access_settings", "delete_records", "manage_moderators"]
      : ["edit_content", "manage_courses", "manage_partners", "view_analytics"];

    try {
      const result = await acceptExistingUserInvite({
        code: inviteCode,
        email,
        firstName: firstName || user?.firstName || email.split("@")[0],
        role,
        permissions: perms,
      });
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast("Invite accepted! Welcome to the admin team.", "success");
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!firstName || !email || !password) { setError("All fields required"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (!inviteCode) { setError("Invalid invite code"); return; }

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

      const role = inviteData?.role || "administrator";
      const perms = inviteData?.permissions?.length > 0 ? inviteData.permissions : role === "administrator"
        ? ["manage_users", "edit_content", "manage_courses", "manage_partners", "view_analytics", "access_settings", "delete_records", "manage_moderators"]
        : ["edit_content", "manage_courses", "manage_partners", "view_analytics"];

      const result = await acceptInviteAction({ code: inviteCode, email, firstName, password, role, permissions: perms });
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

  if (step === "code") {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound size={28} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Join BMAC<span className="text-primary">.</span></h1>
            <p className="text-sm text-muted-foreground mt-2">Enter your invitation code</p>
          </div>

          <form onSubmit={handleCodeSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-secondary">Invitation Code</label>
              <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                placeholder="Paste your code here"
                className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono tracking-wider" />
            </div>
            {validationError && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{validationError}</span>
              </div>
            )}
            <button type="submit" disabled={validating}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {validating ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ArrowRight size={16} /> Verify Code</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-destructive/5 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} className="text-destructive" />
          </div>
          <h1 className="font-display text-xl font-bold text-secondary">Invalid Code</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{validationError}</p>
          <button onClick={() => { setStep("code"); setValidationError(""); }}
            className="mt-6 h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck size={28} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Join BMAC<span className="text-primary">.</span></h1>
            <p className="text-sm text-muted-foreground mt-2">You&apos;re signed in as <span className="font-medium text-secondary">{user?.emailAddresses?.[0]?.emailAddress || email}</span></p>
            {inviteData?.role && <p className="text-xs text-muted-foreground/60 mt-1">Invited as <span className="font-medium capitalize text-secondary">{inviteData.role}</span></p>}
          </div>

          <div className="space-y-5">
            {error && (
              <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button onClick={handleAcceptExisting} disabled={loading}
              className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><ArrowRight size={16} /> Accept Invite</>}
            </button>
          </div>
        </div>
      </div>
    );
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
          {inviteData?.role && <p className="text-xs text-muted-foreground/60 mt-1">Invited as <span className="font-medium capitalize text-secondary">{inviteData.role}</span></p>}
        </div>

        <form onSubmit={handleCreateAccount} className="space-y-5">
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