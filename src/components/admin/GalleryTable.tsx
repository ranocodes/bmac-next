"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Image, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getAll, remove } from "@/data/store";
import { useToast } from "@/components/ui/Toast";

export default function GalleryTable() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    const all = getAll<any>("gallery").map((g: any) => ({
      ...g,
      status: g.status || "draft",
    }));
    setItems(all.reverse());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this gallery item?");
    if (!ok) return;
    remove("gallery", id);
    toast("Gallery item deleted");
    load();
  }

  const filtered = search
    ? items.filter(g => g.alt?.toLowerCase().includes(search.toLowerCase()) || g.category?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Gallery</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage gallery images</p>
        </div>
        <Link href="/admin/gallery/new" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Image</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gallery..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Image size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No gallery items match your search" : "No gallery items yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Add your first image to get started"}
          </p>
          {!search && (
            <Link href="/admin/gallery/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Image
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Image</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Alt Text</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Category</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Status</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(g => (
                  <tr key={g.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={g.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <p className="font-medium text-secondary hidden sm:inline truncate max-w-[120px]">{g.img.split("/").pop()}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-muted-foreground text-xs truncate max-w-[200px]">{g.alt}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground">
                        {g.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        g.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {g.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/gallery/${g.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(g.id)}
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
