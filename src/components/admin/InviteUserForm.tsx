"use client";

import { useEffect, useState } from "react";
import { Send, Copy, Check, Plus, Trash2, Users } from "lucide-react";
import { setItem, getItem } from "@/data/store";
import { useToast } from "@/components/ui/Toast";

const roles = ["Admin", "Moderator"] as const;

export default function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("Moderator");
  const [message, setMessage] = useState("");
  const [invites, setInvites] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = getItem<any[]>("invited_users") || [];
    setInvites(stored);
  }, []);

  function refreshInvites() {
    const stored = getItem<any[]>("invited_users") || [];
    setInvites(stored);
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  function handleSend() {
    if (!email) { toast("Email is required", "error"); return; }
    if (!email.includes("@")) { toast("Invalid email address", "error"); return; }

    const code = generateCode();
    const invite = {
      id: `invite-${Date.now()}`,
      email,
      role,
      message,
      code,
      createdAt: Date.now(),
      used: false,
    };

    const existing = getItem<any[]>("invited_users") || [];
    setItem("invited_users", [...existing, invite]);
    refreshInvites();

    toast("Invite created! Share the code below.", "success");
    setEmail("");
    setMessage("");
    setShowForm(false);
  }

  function handleRevoke(id: string) {
    const existing = getItem<any[]>("invited_users") || [];
    setItem("invited_users", existing.filter((i: any) => i.id !== id));
    refreshInvites();
    toast("Invite revoked", "success");
  }

  function copyCode(code: string, idx: number) {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Invite Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Invite admins and moderators to the dashboard</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
        >
          <Plus size={16} /> {showForm ? "Cancel" : "New Invite"}
        </button>
      </div>

      {showForm && (
        <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4 space-y-4">
          <h2 className="font-display text-lg font-bold text-secondary">New Invitation</h2>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.org"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Role</label>
            <div className="flex gap-2">
              {roles.map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`px-4 py-2 min-h-[40px] rounded-lg text-sm font-medium transition-all ${role === r ? "bg-primary text-primary-foreground" : "bg-background border border-input text-secondary hover:border-primary/50"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Message (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Hey, I'd like you to join the BMAC admin team..."
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none" />
          </div>
          <button onClick={handleSend}
            className="flex items-center justify-center gap-2 min-h-[44px] w-full px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm">
            <Send size={15} /> Send Invitation
          </button>
        </div>
      )}

      <div className="bg-card/50 border border-border/50 rounded-xl p-3 sm:p-4">
        {invites.length === 0 ? (
          <div className="text-center py-16">
            <Users size={48} className="text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No invitations sent yet</p>
            <button onClick={() => setShowForm(true)} className="mt-4 flex items-center gap-2 mx-auto h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
              <Plus size={15} /> Send your first invite
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {invites.map((invite, i) => (
              <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-background border border-border/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{invite.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">{invite.role}</span>
                    {invite.used && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wider">Used</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => copyCode(invite.code, i)}
                    className="flex items-center gap-1.5 h-9 px-3 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-secondary transition-colors">
                    {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIndex === i ? "Copied" : invite.code}
                  </button>
                  <button onClick={() => handleRevoke(invite.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
