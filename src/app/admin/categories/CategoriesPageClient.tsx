"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";
import { getAll, create, remove } from "@/data/store";
import { useToast } from "@/components/ui/Toast";
import { logActivity } from "@/lib/activity";
import type { Category } from "@/types/cms";

export default function CategoriesPageClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    setCategories(getAll<Category>("categories"));
  }

  useEffect(() => { load(); }, []);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast("Category already exists", "error");
      return;
    }
    const id = `cat-${Date.now()}`;
    create<Category>("categories", { id, name });
    logActivity("admin", "create_category", "category", id, `Created category: ${name}`);
    setNewName("");
    toast("Category added");
    load();
  }

  async function handleDelete(id: string) {
    const ok = await confirm("Delete this category?");
    if (!ok) return;
    const cat = categories.find(c => c.id === id);
    remove("categories", id);
    logActivity("admin", "delete_category", "category", id, `Deleted ${cat?.name}`);
    toast("Category deleted");
    load();
  }

  return (
    <div className="space-y-6 max-w-[600px]">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Categories</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage news and event categories</p>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 h-12 sm:h-11 px-5 sm:px-4 rounded-xl border border-input bg-card text-base sm:text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 h-12 sm:h-11 px-6 sm:px-5 rounded-2xl bg-primary text-primary-foreground text-base sm:text-sm font-semibold hover:bg-primary/90 active:scale-[0.97] transition-all"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag size={40} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-secondary">No categories</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first category above</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4 group">
                <div className="flex items-center gap-3">
                  <Tag size={15} className="text-muted-foreground" />
                  <span className="text-sm font-medium text-secondary">{cat.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground opacity-60 sm:opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/5 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
