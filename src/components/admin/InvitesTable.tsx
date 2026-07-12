"use client";

import { useState } from "react";
import { Mail, Search, Send, Clock, CheckCircle2, XCircle, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { resendInviteAction, deleteInviteAction } from "@/actions/admin-users";

export default function InvitesTable({ initialData = [] }: { initialData?: any[] }) {
  const [items, setItems] = useState<any[]>(() => initialData);
  const [search, setSearch] = useState("");
  const [resending, setResending] = useState<string | null>(null);
  const { toast, confirm } = useToast();

  function statusBadge(invite: any) {
    if (invite.used_at) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 size={12} /> Accepted
        </span>
      );
    }
    const expired = new Date(invite.expires_at) < new Date();
    if (expired) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-500">
          <XCircle size={12} /> Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-500">
        <Clock size={12} /> Pending
      </span>
    );
  }

  function roleLabel(role: string) {
    return role === "super_admin" ? "Super Admin" : "Moderator";
  }

  async function handleResend(id: string) {
    setResending(id);
    const result = await resendInviteAction(id);
    setResending(null);
    if (result.error) { toast(result.error, "error"); return; }
    toast("Invite re-sent", "success");
  }

  async function handleRevoke(id: string) {
    const ok = await confirm("Revoke this invite?", { confirmText: "Revoke" });
    if (!ok) return;
    const result = await deleteInviteAction(id);
    if (result.error) { toast(result.error, "error"); return; }
    setItems(prev => prev.filter(i => i.id !== id));
    toast("Invite revoked", "success");
  }

  const filtered = search
    ? items.filter(i =>
        i.email?.toLowerCase().includes(search.toLowerCase()) ||
        i.first_name?.toLowerCase().includes(search.toLowerCase())
      )
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Mail size={24} className="text-primary shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Invites</h1>
          <p className="text-sm text-muted-foreground mt-1">Track pending and accepted admin invitations</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invites..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Mail size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No invites match your search" : "No invites yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Invite an admin to get started"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Name</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Email</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Role</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Created</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4">Status</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-36">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(i => (
                  <tr key={i.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(i.first_name || i.email || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-secondary">{i.first_name || "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-muted-foreground text-xs">{i.email}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">{roleLabel(i.role)}</span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(i.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {statusBadge(i)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!i.used_at && (
                          <>
                            <button
                              disabled={resending === i.id}
                              onClick={() => handleResend(i.id)}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-all disabled:opacity-50"
                            >
                              {resending === i.id ? (
                                <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                              ) : (
                                <Send size={12} />
                              )}
                              Resend
                            </button>
                            <button
                              onClick={() => handleRevoke(i.id)}
                              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/5 transition-all"
                            >
                              <X size={12} />
                              Revoke
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
