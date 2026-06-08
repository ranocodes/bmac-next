"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquareQuote, Plus, Pencil, Trash2, Search } from "lucide-react";
import { getAll, remove } from "@/data/store";
import { useToast } from "@/components/ui/Toast";

export default function TestimonialTable() {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    setItems(getAll<any>("testimonials").reverse());
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this testimonial?");
    if (!ok) return;
    remove("testimonials", id);
    toast("Testimonial deleted");
    load();
  }

  const filtered = search
    ? items.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) || t.quote?.toLowerCase().includes(search.toLowerCase()))
    : items;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage testimonials</p>
        </div>
        <Link href="/admin/testimonials/new" className="flex items-center gap-2 h-11 px-5 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
          <Plus size={16} /> <span className="hidden sm:inline">New Testimonial</span>
        </Link>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search testimonials..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <MessageSquareQuote size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No testimonials match your search" : "No testimonials yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Add your first testimonial to get started"}
          </p>
          {!search && (
            <Link href="/admin/testimonials/new" className="mt-5 flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all">
              <Plus size={15} /> New Testimonial
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
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Quote</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Status</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {t.src && (
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-muted shrink-0">
                            <img src={t.src} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-secondary">{t.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{t.designation}</p>
                          <span className="text-xs text-muted-foreground md:hidden mt-0.5">
                            {t.status === "published" ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-muted-foreground text-xs line-clamp-2 max-w-md">{t.quote}</p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                        t.status === "published"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {t.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/testimonials/${t.id}/edit`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                          <Pencil size={14} />
                        </Link>
                        <button onClick={() => handleDelete(t.id)}
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
