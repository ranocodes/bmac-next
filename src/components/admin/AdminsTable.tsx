"use client";

import { useState } from "react";
import Link from "next/link";
import { UserCog, Plus, Search, ShieldCheck, Shield, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { adminResetPassword } from "@/actions/admin-auth";
import { deleteAdminUser } from "@/actions/admin-users";

export default function AdminsTable({ initialData = [] }: { initialData?: any[] }) {
  const [items, setItems] = useState<any[]>(() => initialData.slice().reverse());
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  function roleBadge(role: string) {
    const isSuper = role === "super_admin";
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
        isSuper ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500"
      }`}>
        {isSuper ? <ShieldCheck size={12} /> : <Shield size={12} />}
        {role === "super_admin" ? "Super Admin" : "Moderator"}
      </span>
    );
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this admin account? This cannot be undone.", { confirmText: "Delete" });
    if (!ok) return;
    const result = await deleteAdminUser(id);
    if (result.error) { toast(result.error, "error"); return; }
    setItems(prev => prev.filter(u => u.id !== id));
    toast("Admin deleted", "success");
  }

  const filtered = search
    ? items.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.first_name?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <UserCog size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Admins</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage administrator accounts</p>
          </div>
        </div>
        <Link href="/admin/admins/invite" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">Invite Admin</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search admins..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <UserCog size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No admins match your search" : "No admins yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Invite your first admin to get started"}
          </p>
          {!search && (
            <Link href="/admin/admins/invite" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> Invite Admin
            </Link>
          )}
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
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {(u.first_name || u.email || "?").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <p className="font-medium text-secondary">{u.first_name || "—"}</p>
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
                          title="Reset password"
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
                          onClick={() => handleDelete(u.id)}>
                          <Trash2 size={14} />
                        </button>
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
