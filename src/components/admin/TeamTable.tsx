"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getAll, remove } from "@/data/store";
import { useToast } from "@/components/ui/Toast";

export default function TeamTable() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    const all = getAll<any>("team").map((m: any) => ({
      ...m,
      status: m.status || "draft",
    }));
    setItems(all.reverse());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this team member?");
    if (!ok) return;
    remove("team", id);
    toast("Team member deleted");
    load();
  }

  const filtered = search
    ? items.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) || m.role?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Team</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage team members</p>
        </div>
        <Link href="/admin/team/new" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Member</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Users size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No team members match your search" : "No team members yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Add your first team member to get started"}
          </p>
          {!search && (
            <Link href="/admin/team/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Member
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
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Role</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Status</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {m.img && (
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
                            <img src={m.img} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-secondary">{m.name}</p>
                          <span className="text-xs text-muted-foreground sm:hidden mt-0.5">
                            {m.role} &middot; {m.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-muted-foreground text-xs">{m.role}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        m.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {m.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/team/${m.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(m.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
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
