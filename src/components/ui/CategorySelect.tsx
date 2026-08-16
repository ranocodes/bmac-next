"use client";

import { useEffect, useState } from "react";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { getCategories } from "@/actions/categories";
import { createItem } from "@/actions/crud";
import type { Category } from "@/types/cms";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export default function CategorySelect({ value, onChange, error }: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  const filtered = categories.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const match = categories.find(c => c.name.toLowerCase() === value.toLowerCase());

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const id = `cat-${Date.now()}`;
      await createItem("categories", { id, name });
      const next = [...categories, { id, name }].sort((a, b) => a.name.localeCompare(b.name));
      setCategories(next);
      onChange(name);
      setNewName("");
      setCreating(false);
      setOpen(false);
      setQuery("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center justify-between w-full px-3 py-2.5 min-h-[44px] bg-background border rounded-lg text-sm text-secondary focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors ${
          error ? "border-destructive/50" : "border-border"
        }`}
      >
        <span className={match ? "" : "text-muted-foreground/40"}>{value || "Select category"}</span>
        <ChevronDown size={16} className="text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-border/50">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search categories..."
              className="w-full px-3 py-2 min-h-[40px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && !query && (
              <p className="px-4 py-3 text-xs text-muted-foreground">No categories yet</p>
            )}
            {filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => { onChange(c.name); setOpen(false); setQuery(""); }}
                className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm text-secondary hover:bg-muted transition-colors"
              >
                {c.name}
                {match?.id === c.id && <Check size={15} className="text-primary" />}
              </button>
            ))}
            {query.trim() && !categories.some(c => c.name.toLowerCase() === query.trim().toLowerCase()) && (
              <button
                type="button"
                onClick={() => { setNewName(query.trim()); setCreating(true); }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-sm text-primary hover:bg-muted transition-colors"
              >
                <Plus size={14} /> Create &quot;{query.trim()}&quot;
              </button>
            )}
          </div>
        </div>
      )}

      {creating && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4">
          <form onSubmit={handleCreate} className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-secondary">New Category</h3>
              <button type="button" onClick={() => setCreating(false)} className="text-muted-foreground hover:text-secondary" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Category name"
              className="w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors"
            />
            <div className="flex items-center gap-3 justify-end mt-5">
              <button type="button" onClick={() => setCreating(false)} className="h-9 px-4 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">Cancel</button>
              <button type="submit" disabled={busy || !newName.trim()} className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                {busy ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
