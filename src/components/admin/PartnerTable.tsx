"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Handshake, Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { deleteItem, updateItem } from "@/actions/crud";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";
import type { Partner } from "@/types/cms";

export default function PartnerTable({ initialData }: { initialData: Partner[] }) {
  const [items, setItems] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const user = useAdmin();
  const { toast, confirm } = useToast();

  useEffect(() => {
    const sorted = [...initialData].map(p => ({
      ...p,
      status: p.status || "active",
      order: p.order ?? 999,
    })).sort((a, b) => a.order - b.order);
    setItems(sorted);
  }, [initialData]);

  const canDelete = user?.permissions.includes("manage_partners");

  async function handleDelete(id: string) {
    if (!canDelete) { toast("You don't have permission to delete partners", "error"); return; }
    const ok = await confirm("Are you sure you want to delete this partner?");
    if (!ok) return;
    await deleteItem("partners", id);
    setItems(p => p.filter(i => i.id !== id));
    toast("Partner deleted", "success");
  }

  function moveItem(id: string, dir: -1 | 1) {
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return;
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[idx], next[target]] = [next[target], next[idx]];
    const reordered = next.map((item, i) => ({ ...item, order: i + 1 }));
    reordered.forEach(item => updateItem("partners", item.id, { order: item.order }));
    setItems(reordered);
  }

  function toggleStatus(id: string, current?: string) {
    const next = current === "active" ? "hidden" : "active";
    updateItem("partners", id, { status: next });
    setItems(p => p.map(i => i.id === id ? { ...i, status: next as "active" | "hidden" } : i));
    toast(`Partner ${next === "active" ? "shown" : "hidden"}`, "success");
  }

  const filtered = items.filter(i =>
    !search || i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Partners</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage partner organizations</p>
        </div>
        <Link href="/admin/partners/new"
          className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> New Partner
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-input text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-border/30 rounded-xl">
          <Handshake size={48} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{search ? "No partners match your search" : "No partners yet"}</p>
          {!search && (
            <Link href="/admin/partners/new" className="mt-5 inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> Add your first partner
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 w-20">Order</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3">Partner</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 hidden sm:table-cell">URL</th>
                <th className="text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 w-20">Status</th>
                <th className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-border/10 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => moveItem(item.id, -1)} disabled={idx === 0}
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-secondary disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                        <ArrowUp size={13} />
                      </button>
                      <button onClick={() => moveItem(item.id, 1)} disabled={idx === filtered.length - 1}
                        className="w-6 h-6 flex items-center justify-center rounded text-muted-foreground/40 hover:text-secondary disabled:opacity-20 disabled:cursor-not-allowed transition-colors">
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                        {item.logo && !item.logo.includes("placeholder") ? (
                          <img src={item.logo} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                            {item.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-medium text-secondary">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {item.url ? (
                      <span className="text-xs text-muted-foreground truncate block max-w-[200px]">{item.url}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(item.id, item.status)}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider transition-colors ${item.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {item.status === "active" ? <Eye size={11} /> : <EyeOff size={11} />}
                      {item.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/partners/${item.id}/edit`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                        <Pencil size={14} />
                      </Link>
                      <button onClick={() => handleDelete(item.id)}
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
      )}
    </div>
  );
}
