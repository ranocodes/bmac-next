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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <Handshake size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Partners</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage partner organizations</p>
          </div>
        </div>
        <Link href="/admin/partners/new"
          className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
          <Plus size={16} /> New Partner
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..."
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-border text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Handshake size={44} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{search ? "No partners match your search" : "No partners yet"}</p>
          {!search && (
            <Link href="/admin/partners/new" className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus size={15} /> Add your first partner
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map(item => (
              <div key={item.id} className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-secondary truncate">{item.name}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                      {item.status === "active" ? <Eye size={10} /> : <EyeOff size={10} />}
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground truncate">{item.url || "—"}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Link href={`/admin/partners/${item.id}/edit`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => handleDelete(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-20">Order</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Partner</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">URL</th>
                <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-20">Status</th>
                <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-24">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
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
                            <img src={item.logo} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase">
                              {item.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-secondary block truncate">{item.name}</span>
                          <span className="text-xs text-muted-foreground/60 block truncate sm:hidden">
                            {item.url || "—"}
                          </span>
                        </div>
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
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider transition-colors ${item.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
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
          </div>
        </>
      )}
    </div>
  );
}
