"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";
import { deleteItem } from "@/actions/crud";
import { useToast } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/auth/admin-context";
import type { Program } from "@/types/cms";

export default function ProgramTable({ initialData }: { initialData: any[] }) {
  const [programs, setPrograms] = useState<any[]>([...initialData].reverse().map((p: any) => ({
    ...p,
    desc: p.desc || p.description || "",
    img: p.img || p.img_url || "",
    icon: p.icon || p.icon_name || "",
    color: p.color || p.color_class || "",
    landingPage: p.landingPage || false,
    status: p.status || "draft",
  })));
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this program?");
    if (!ok) return;
    await deleteItem("programs", id);
    toast("Program deleted");
    setPrograms((prev: any[]) => prev.filter((p: any) => p.id !== id));
  }

  const filtered = search
    ? programs.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()))
    : programs;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BookOpen size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Programs</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage programs</p>
          </div>
        </div>
        <Link href="/admin/programs/new" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Program</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programs..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <BookOpen size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No programs match your search" : "No programs yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Create your first program to get started"}
          </p>
          {!search && (
            <Link href="/admin/programs/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Program
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Title</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Landing</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Status</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => (
                  <tr key={p.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <BookOpen size={14} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-secondary">{p.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 sm:hidden">
                            {p.landingPage ? "On Homepage" : "Hidden"} &middot; {p.status === "published" ? "Published" : "Draft"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        p.landingPage
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {p.landingPage ? "On Homepage" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        p.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {p.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/programs/${p.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p.id)}
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
