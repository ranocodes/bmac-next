"use client";

import { useEffect, useState } from "react";
import { Users, Search, Trash2, Shield, ShieldAlert, ShieldCheck, ShieldEllipsis, X, Check } from "lucide-react";
import { useAdmin } from "@/lib/auth/admin-context";
import { updateUserPermissions, deleteAdminUser } from "@/actions/admin-users";
import { useToast } from "@/components/ui/Toast";
import type { Permission } from "@/types/cms";

const roleIcons: Record<string, any> = {
  super_admin: ShieldAlert,
  administrator: ShieldCheck,
  moderator: Shield,
};

const roleColors: Record<string, string> = {
  super_admin: "text-purple-600 bg-purple-100",
  administrator: "text-blue-600 bg-blue-100",
  moderator: "text-emerald-600 bg-emerald-100",
};

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

export default function UsersTable({ initialData }: { initialData: any[] }) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const currentUser = useAdmin();
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editPerms, setEditPerms] = useState<Permission[]>([]);
  const { toast, confirm } = useToast();

  useEffect(() => {
    const mapped = initialData.map(u => ({
      ...u,
      firstName: u.first_name,
      createdAt: u.created_at,
    }));
    setUsers(mapped);
  }, [initialData]);

  function openPermissionEditor(user: any) {
    setEditingUser(user);
    setEditPerms([...user.permissions]);
  }

  function toggleEditPerm(key: Permission) {
    setEditPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  }

  async function savePermissions() {
    if (!editingUser) return;
    await updateUserPermissions(editingUser.id, editPerms);
    setUsers(p => p.map(u => u.id === editingUser.id ? { ...u, permissions: editPerms } : u));
    toast("Permissions updated", "success");
    setEditingUser(null);
  }

  async function handleDelete(id: string, userEmail: string) {
    if (userEmail === currentUser?.email) {
      toast("You cannot delete your own account", "error");
      return;
    }
    const target = users.find(u => u.id === id);
    if (target?.role === "super_admin") {
      toast("Cannot delete a Super Admin account", "error");
      return;
    }
    if (currentUser?.role !== "super_admin") {
      toast("Only Super Admin can delete users", "error");
      return;
    }
    const ok = await confirm(`Delete user ${target?.firstName || userEmail}?`);
    if (!ok) return;
    await deleteAdminUser(id);
    setUsers(p => p.filter(u => u.id !== id));
    toast("User deleted", "success");
  }

  const filtered = search
    ? users.filter(u => u.email?.toLowerCase().includes(search.toLowerCase()) || u.firstName?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const isSuper = currentUser?.role === "super_admin";

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage admin accounts</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-input text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-border/30 rounded-xl">
          <Users size={48} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{search ? "No users match your search" : "No admin users yet"}</p>
        </div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3">User</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 hidden md:table-cell">Role</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 hidden lg:table-cell">Created</th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const RoleIcon = roleIcons[u.role] || Shield;
                  const roleColor = roleColors[u.role] || "text-muted-foreground bg-muted";
                  return (
                    <tr key={u.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-primary">
                              {u.firstName ? u.firstName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-secondary">{u.firstName}
                              {u.email === currentUser?.email && <span className="text-[10px] text-muted-foreground ml-1.5">(you)</span>}
                            </p>
                            <span className="text-xs text-muted-foreground sm:hidden">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${roleColor}`}>
                          <RoleIcon size={11} />
                          {u.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isSuper && u.role !== "super_admin" && (
                            <button onClick={() => openPermissionEditor(u)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
                              <ShieldEllipsis size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(u.id, u.email)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/20 backdrop-blur-sm p-4" onClick={() => setEditingUser(null)}>
          <div className="bg-card rounded-2xl shadow-xl border border-border/50 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/30">
              <div>
                <h3 className="font-display text-lg font-bold text-secondary">Edit Permissions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{editingUser.firstName} &middot; {editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">Role</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${roleColors[editingUser.role] || "text-muted-foreground bg-muted"}`}>
                  {editingUser.role.replace("_", " ")}
                </span>
              </div>
              {allPermissions.map(p => {
                const enabled = editPerms.includes(p.key);
                return (
                  <button key={p.key} onClick={() => toggleEditPerm(p.key)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl border transition-all text-left ${
                      enabled ? "bg-primary/5 border-primary/20" : "bg-background border-border/30 hover:border-muted-foreground/30"
                    }`}>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {enabled && <Check size={12} />}
                    </div>
                    <span className="text-sm font-medium text-secondary">{p.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 p-5 border-t border-border/30">
              <button onClick={() => setEditingUser(null)}
                className="flex-1 h-10 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
                Cancel
              </button>
              <button onClick={savePermissions}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
