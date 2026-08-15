"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCog, Plus, Search, ShieldCheck, Shield, Mail, Trash2, RefreshCw, Pencil, X, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/auth/admin-context";
import { adminResetPassword } from "@/actions/admin-auth";
import { deleteAdminUser, updateAdminUser, resendCredentialsAction } from "@/actions/admin-users";
import DeleteReasonModal from "./DeleteReasonModal";
import type { AdminRole, Permission } from "@/types/cms";
import { PERMISSION_LABELS } from "@/lib/auth/permissions";

const allPermissions = PERMISSION_LABELS;

function parsePerms(p: unknown): Permission[] {
  if (Array.isArray(p)) return p as Permission[];
  if (typeof p === "string") {
    try {
      const arr = JSON.parse(p);
      return Array.isArray(arr) ? (arr as Permission[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function AdminsTable({ initialData = [] }: { initialData?: any[] }) {
  const [items, setItems] = useState<any[]>(() => initialData.slice().reverse());
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();
  const currentUser = useAdmin();

  const [editing, setEditing] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<AdminRole>("moderator");
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const [editSaving, setEditSaving] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string; warning?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; email: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  function roleBadge(role: string) {
    const isSuper = role === "super_admin";
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isSuper ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-700"
      }`}>
        {isSuper ? <ShieldCheck size={12} /> : <Shield size={12} />}
        {isSuper ? "Super Admin" : "Moderator"}
      </span>
    );
  }

  async function handleDelete(id: string, email: string, name: string) {
    if (email === currentUser?.email) {
      toast("You cannot delete your own account", "error");
      return;
    }
    setDeleteTarget({ id, email, name });
  }

  async function handleConfirmDelete(reason: string) {
    if (!deleteTarget) return;
    setDeleting(true);
    const result = await deleteAdminUser(deleteTarget.id, reason);
    setDeleting(false);
    if (result.error) { toast(result.error, "error"); setDeleteTarget(null); return; }
    setItems(prev => prev.filter(u => u.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast("Admin deleted", "success");
  }

  function openEdit(u: any) {
    setEditing(u);
    setEditName(u.first_name || "");
    setEditEmail(u.email || "");
    setEditRole((u.role === "super_admin" ? "super_admin" : "moderator") as AdminRole);
    setEditPerms(parsePerms(u.permissions));
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setEditSaving(true);
    const opts: { firstName?: string; email?: string; role?: AdminRole; permissions?: Permission[] } = {
      firstName: editName.trim(),
      email: editEmail.trim(),
    };
    const isSuper = editRole === "super_admin";
    const nextPerms = isSuper ? allPermissions.map(p => p.key) : editPerms;
    if (editRole !== editing.role) opts.role = editRole;
    if (JSON.stringify(nextPerms) !== JSON.stringify(parsePerms(editing.permissions))) opts.permissions = nextPerms;
    const result = await updateAdminUser(editing.id, opts);
    setEditSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setItems(prev => prev.map(u => u.id === editing.id ? { ...u, first_name: editName.trim(), email: editEmail.trim(), role: editRole, permissions: nextPerms } : u));
    setEditing(null);
    toast("Admin updated", "success");
  }

  async function handleResendCredentials(id: string, email: string) {
    const ok = await confirm(`Send a new password to ${email}? The old password will stop working.`, { confirmText: "Send" });
    if (!ok) return;
    const result = await resendCredentialsAction(id);
    if (result.error) { toast(result.error, "error"); return; }
    if (result.password) {
      setCredentials({ email: result.email || email, password: result.password, warning: result.warning });
    } else {
      toast("Credentials sent to " + (result.email || email), "success");
    }
  }

  const filtered = search
    ? items.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.first_name?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <UserCog size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Admins</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage administrator accounts</p>
          </div>
        </div>
        <Link href="/admin/admins/new" className="flex items-center gap-2 h-11 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Admin</span>
        </Link>
      </div>

      {credentials && (
        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
                <KeyRound size={16} className="text-primary" />
                New credentials for {credentials.email}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Password: <span className="font-mono font-bold text-secondary select-all">{credentials.password}</span>
              </p>
              {credentials.warning && (
                <p className="mt-1 text-xs text-destructive">Email failed to send — share the password manually.</p>
              )}
            </div>
            <button onClick={() => setCredentials(null)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all shrink-0">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admins..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <UserCog size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No admins match your search" : "No admins yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Create your first admin to get started"}
          </p>
          {!search && (
            <Link href="/admin/admins/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Admin
            </Link>
          )}
        </div>
      ) : (
        <>
        <div className="lg:hidden space-y-2">
          {filtered.map(u => {
            const isSelf = u.email === currentUser?.email;
            return (
              <div key={u.id} className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {(u.first_name || u.email || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">
                    {u.first_name || "—"}
                    {isSelf && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                  <div className="mt-1">{roleBadge(u.role)}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                    title="Edit admin"
                    onClick={() => openEdit(u)}>
                    <Pencil size={14} />
                  </button>
                  {!isSelf && (
                    <>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                        title="Resend login credentials"
                        onClick={() => handleResendCredentials(u.id, u.email)}>
                        <RefreshCw size={14} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                        title="Send password reset email"
                        onClick={async () => {
                          const ok = await confirm(`Send password reset email to ${u.email}?`, { confirmText: "Send" });
                          if (!ok) return;
                          const res = await adminResetPassword(u.id);
                          if (res.error) { toast(res.error, "error"); return; }
                          toast("Reset link sent to their email", "success");
                        }}>
                        <Mail size={14} />
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                        title="Delete admin"
                        onClick={() => handleDelete(u.id, u.email, u.first_name || u.email)}>
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Name</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Email</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Role</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-44">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const isSelf = u.email === currentUser?.email;
                  return (
                    <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {(u.first_name || u.email || "?").charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-medium text-secondary">
                            {u.first_name || "—"}
                            {isSelf && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-muted-foreground text-xs">{u.email}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        {roleBadge(u.role)}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                            title="Edit admin"
                            onClick={() => openEdit(u)}>
                            <Pencil size={14} />
                          </button>
                          {!isSelf && (
                            <>
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                                title="Resend login credentials"
                                onClick={() => handleResendCredentials(u.id, u.email)}>
                                <RefreshCw size={14} />
                              </button>
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                                title="Send password reset email"
                                onClick={async () => {
                                  const ok = await confirm(`Send password reset email to ${u.email}?`, { confirmText: "Send" });
                                  if (!ok) return;
                                  const res = await adminResetPassword(u.id);
                                  if (res.error) { toast(res.error, "error"); return; }
                                  toast("Reset link sent to their email", "success");
                                }}>
                                <Mail size={14} />
                              </button>
                              <button
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                                title="Delete admin"
                                onClick={() => handleDelete(u.id, u.email, u.first_name || u.email)}>
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(null)}>
          <form onSubmit={saveEdit} className="bg-card rounded-xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <div>
                <h3 className="font-display text-lg font-bold text-secondary">Edit Admin</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{editing.first_name || editing.email}</p>
              </div>
              <button type="button" onClick={() => setEditing(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">Name</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">Email</label>
                <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                  placeholder="admin@example.org"
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                {editing.email === currentUser?.email && (
                  <p className="text-xs text-muted-foreground">You cannot change your own email.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">Role</label>
                <select value={editRole} onChange={e => setEditRole(e.target.value as AdminRole)} disabled={editing.email === currentUser?.email}
                  className="w-full h-11 px-4 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-60">
                  <option value="moderator">Moderator</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {editing.email === currentUser?.email && (
                  <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary">Permissions</label>
                {editRole === "super_admin" ? (
                  <p className="text-xs text-muted-foreground">Super admins automatically receive all permissions.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allPermissions.map(perm => {
                      const checked = editPerms.includes(perm.key);
                      return (
                        <label key={perm.key}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all ${
                            checked ? "border-primary/40 bg-primary/5 text-secondary" : "border-border bg-background text-muted-foreground hover:border-primary/30"
                          }`}>
                          <input type="checkbox" checked={checked} disabled={editing.email === currentUser?.email}
                            onChange={() => setEditPerms(p => p.includes(perm.key) ? p.filter(k => k !== perm.key) : [...p, perm.key])}
                            className="h-4 w-4 rounded border-border accent-primary" />
                          <span>{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-border/30">
              <button type="button" onClick={() => setEditing(null)}
                className="flex-1 h-10 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={editSaving}
                className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60">
                {editSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <DeleteReasonModal
        open={!!deleteTarget}
        title={`Delete admin ${deleteTarget?.name || ""}?`}
        description="This action cannot be undone."
        busy={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
