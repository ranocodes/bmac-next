"use client";

import { useState } from "react";
import { Tag, Plus, Trash2 } from "lucide-react";
import { createItem, deleteItem } from "@/actions/crud";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";
import type { Category } from "@/types/cms";

export default function CategoriesPageClient({ initialData }: { initialData: Category[] }) {
  const [categories, setCategories] = useState<Category[]>(initialData);
  const [newName, setNewName] = useState("");
  const user = useAdmin();
  const { toast, confirm } = useToast();

  const canManage = user?.permissions.includes("manage_categories");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) { toast("You don't have permission to manage categories", "error"); return; }
    const name = newName.trim();
    if (!name) return;
    if (categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      toast("Category already exists", "error");
      return;
    }
    const id = `cat-${Date.now()}`;
    await createItem("categories", { id, name });
    setCategories(p => [...p, { id, name } as Category]);
    setNewName("");
    toast("Category added");
  }

  async function handleDelete(id: string) {
    if (!canManage) { toast("You don't have permission to delete categories", "error"); return; }
    const ok = await confirm("Delete this category?");
    if (!ok) return;
    await deleteItem("categories", id);
    setCategories(p => p.filter(c => c.id !== id));
    toast("Category deleted");
  }

  return (
    <div className="space-y-6 max-w-[600px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Tag size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Categories</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage news and event categories</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 h-12 sm:h-11 px-5 sm:px-4 rounded-lg border border-border bg-card text-base sm:text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
        <button
          type="submit"
          className="flex items-center justify-center gap-2 h-12 sm:h-11 px-6 sm:px-5 rounded-lg bg-primary text-primary-foreground text-base sm:text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag size={40} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-secondary">No categories</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first category above</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
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
