"use client";

import { useState } from "react";
import { Send, Copy, Check, Plus, Trash2, Users, Link as LinkIcon, Mail } from "lucide-react";
import { createInvite, revokeInvite } from "@/actions/invitations";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";
import type { Permission } from "@/types/cms";

const roles = ["administrator", "moderator"] as const;

const allPermissions: { key: Permission; label: string }[] = [
  { key: "manage_users", label: "Manage Users" },
  { key: "edit_content", label: "Edit Content" },
  { key: "manage_courses", label: "Manage Courses" },
  { key: "manage_partners", label: "Manage Partners" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "access_settings", label: "Access Settings" },
  { key: "delete_records", label: "Delete Records" },
  { key: "manage_moderators", label: "Manage Moderators" },
];

const roleDefaults: Record<string, Permission[]> = {
  administrator: ["manage_users", "edit_content", "manage_courses", "manage_partners", "view_analytics", "delete_records"],
  moderator: ["edit_content", "manage_courses", "manage_partners", "view_analytics"],
};

export default function InviteUserForm({ initialData }: { initialData: any[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("moderator");
  const [message, setMessage] = useState("");
  const [invites, setInvites] = useState<any[]>(initialData);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(roleDefaults.moderator);
  const user = useAdmin();
  const { toast } = useToast();

  function isAccepted(email: string) {
    return false;
  }

  function generateCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  async function handleSend() {
    if (!user?.permissions.includes("manage_users")) {
      toast("You don't have permission to send invites", "error");
      return;
    }
    if (!email) { toast("Email is required", "error"); return; }
    if (!email.includes("@")) { toast("Invalid email address", "error"); return; }

    const code = generateCode();
    const invite = {
      id: `invite-${Date.now()}`,
      email,
      role,
      code,
      permissions,
      invited_by: user.email,
      message: message || "",
    };

    await createInvite(invite);
    setInvites(p => [...p, { ...invite, created_at: new Date().toISOString(), used: false }]);
    toast("Invite link created! Share it with the user.", "success");
    setEmail("");
    setMessage("");
    setShowForm(false);
  }

  async function handleRevoke(id: string) {
    if (!user?.permissions.includes("manage_users")) {
      toast("You don't have permission to revoke invites", "error");
      return;
    }
    await revokeInvite(id);
    setInvites(p => p.filter(i => i.id !== id));
    toast("Invite revoked", "success");
  }

  function copyCode(code: string, idx: number) {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  function copyInviteLink(code: string, idx: number) {
    const link = `${window.location.origin}/admin/accept-invite?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(idx);
    setTimeout(() => setCopiedLink(null), 2000);
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
                  className={`px-4 py-2 min-h-[40px] rounded-lg text-sm font-medium capitalize transition-all ${role === r ? "bg-primary text-primary-foreground" : "bg-background border border-input text-secondary hover:border-primary/50"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Permissions</label>
            <div className="flex flex-wrap gap-2">
              {allPermissions.map(p => (
                <button key={p.key} type="button" onClick={() => setPermissions(perms => perms.includes(p.key) ? perms.filter(k => k !== p.key) : [...perms, p.key])}
                  className={`px-3 py-1.5 min-h-[34px] rounded-lg text-xs font-medium transition-all ${permissions.includes(p.key) ? "bg-primary/10 text-primary border border-primary/20" : "bg-background border border-input text-muted-foreground hover:text-secondary"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary/80 mb-1.5">Personal Note (optional)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} placeholder="Hey, I'd like you to join the BMAC admin team..."
              className="w-full px-3 py-2.5 bg-background border border-input rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors resize-none" />
          </div>
          <button onClick={handleSend}
            className="flex items-center justify-center gap-2 min-h-[44px] w-full px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors text-sm">
            <Send size={15} /> Create Invite Link
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
            {invites.map((invite, i) => {
              const accepted = isAccepted(invite.email);
              return (
                <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-background border border-border/30 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{invite.email}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-wider">{invite.role}</span>
                      {accepted || invite.used ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 uppercase tracking-wider">Accepted</span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 uppercase tracking-wider">Pending</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:items-center sm:gap-2 gap-1.5">
                    <button onClick={() => copyInviteLink(invite.code, i)}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-secondary transition-colors">
                      {copiedLink === i ? <Check size={14} /> : <LinkIcon size={14} />}
                      <span className="hidden sm:inline">{copiedLink === i ? "Copied!" : "Copy Link"}</span>
                    </button>
                    {!accepted && !invite.used && (
                      <a href={`mailto:${invite.email}?subject=Join%20the%20BMAC%20Admin%20Team&body=You%27ve%20been%20invited%20to%20join%20the%20BMAC%20admin%20dashboard.%0A%0AOpen%20this%20link%20to%20accept%3A%0A${typeof window !== "undefined" ? window.location.origin : ""}/admin/accept-invite?code=${invite.code}%0A%0ARole%3A%20${invite.role}`}
                        className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-secondary transition-colors">
                        <Mail size={14} /> <span className="hidden sm:inline">Email</span>
                      </a>
                    )}
                    <button onClick={() => copyCode(invite.code, i)}
                      className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-muted text-xs font-medium text-muted-foreground hover:text-secondary transition-colors">
                      {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                      <span className="hidden sm:inline">{copiedIndex === i ? "Copied" : "Code"}</span>
                    </button>
                    <button onClick={() => handleRevoke(invite.id)}
                      className="flex items-center justify-center h-9 px-3 rounded-lg bg-muted text-xs font-medium text-destructive hover:bg-destructive/10 transition-all">
                      <Trash2 size={14} /> <span className="hidden sm:inline">Revoke</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
