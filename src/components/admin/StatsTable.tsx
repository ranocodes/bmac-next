"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Plus, Pencil, Trash2, Search, Users, GraduationCap, Building2, BookOpen, Trophy, Activity, Heart, Star, Target, Globe, Award, Zap, TrendingUp, CheckCircle, School, Lightbulb, Rocket, Palette, Camera, Music, Compass, Brain, Feather } from "lucide-react";
import { deleteItem } from "@/actions/crud";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";

const ICON_MAP: Record<string, any> = {
  Users, GraduationCap, Building2, BookOpen, Trophy, Activity,
  Heart, Star, Target, Globe, Award, Zap, TrendingUp, CheckCircle,
  School, Lightbulb, Rocket, Palette, Camera, Music, Compass, Brain, Feather,
};

function resolveIcon(name: string) {
  return ICON_MAP[name] || BarChart3;
}

export default function StatsTable({ initialData }: { initialData: any[] }) {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const user = useAdmin();
  const { toast, confirm } = useToast();

  useEffect(() => {
    const mapped = initialData.map(s => ({
      ...s,
      status: s.status || "draft",
    }));
    setItems(mapped);
  }, [initialData]);

  const canDelete = user?.permissions.includes("manage_stats");

  async function handleDelete(id: string) {
    if (!canDelete) { toast("You don't have permission to delete stats", "error"); return; }
    const ok = await confirm("Delete this stat?");
    if (!ok) return;
    await deleteItem("impact_stats", id);
    setItems(p => p.filter(i => i.id !== id));
    toast("Stat deleted");
  }

  const filtered = search
    ? items.filter(s => s.label?.toLowerCase().includes(search.toLowerCase()) || s.num?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <BarChart3 size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Stats</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage impact statistics</p>
          </div>
        </div>
        <Link href="/admin/stats/new" className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Stat</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stats..."
          className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <BarChart3 size={44} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No stats match your search" : "No stats yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Add your first stat to get started"}
          </p>
          {!search && items.length < 3 && (
            <Link href="/admin/stats/new" className="mt-5 flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
              <Plus size={15} /> New Stat
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map(s => {
              const IconComp = resolveIcon(s.icon);
              return (
                <div key={s.id} className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {IconComp && (
                        <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                          <IconComp size={14} />
                        </span>
                      )}
                      <p className="font-display text-lg font-bold text-secondary truncate">{s.num}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                        s.status === "published"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {s.status === "published" ? "Published" : "Draft"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{s.label}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/admin/stats/${s.id}/edit`}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                      <Pencil size={14} />
                    </Link>
                    <button onClick={() => handleDelete(s.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
                      <Trash2 size={14} />
                    </button>
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
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Stat</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Label</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Icon</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(s => {
                    const IconComp = resolveIcon(s.icon);
                    return (
                      <tr key={s.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {IconComp && (
                              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                                <IconComp size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-display text-xl font-bold text-secondary">{s.num}</p>
                              <span className="text-xs text-muted-foreground sm:hidden mt-0.5">
                                {s.label} &middot; {s.status === "published" ? "Published" : "Draft"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <p className="text-muted-foreground text-xs">{s.label}</p>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                            {s.icon}
                          </span>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            s.status === "published"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {s.status === "published" ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/stats/${s.id}/edit`}
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                              <Pencil size={14} />
                            </Link>
                            <button onClick={() => handleDelete(s.id)}
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
        </>
      )}
    </div>
  );
}
