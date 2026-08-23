"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import { changePassword } from "@/actions/public-auth";
import { SubmitButton } from "@/components/ui/SubmitButton";

export default function PasswordChangeForm() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!current || !newPass || !confirm) { setError("All fields required"); return; }
    if (newPass.length < 8) { setError("New password must be at least 8 characters"); return; }
    if (newPass !== confirm) { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const result = await changePassword(current, newPass);
      if (result.error) { setError(result.error); setLoading(false); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary">Current Password</label>
        <div className="relative">
          <input type={showCurrent ? "text" : "password"} value={current} onChange={e => setCurrent(e.target.value)}
            placeholder="Current password"
            className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
            {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary">New Password</label>
        <div className="relative">
          <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
            placeholder="New password"
            className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          <button type="button" onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary">
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary">Confirm Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full h-11 px-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <SubmitButton pending={loading}>
        <CheckCircle size={16} /> Update Password
      </SubmitButton>
    </form>
  );
}
