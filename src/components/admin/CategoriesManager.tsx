"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { createCategory, deleteCategory, getCategoriesWithUsage, renameCategory, type CategoryUsage } from "@/actions/categories";

function inputCls() {
  return "w-full px-3 py-2.5 min-h-[44px] bg-background border border-border rounded-lg text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors";
}

export default function CategoriesManager() {
  const [items, setItems] = useState<CategoryUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<CategoryUsage | null>(null);
  const [reassignTo, setReassignTo] = useState("");

  const refresh = useCallback(() => {
    getCategoriesWithUsage().then(setItems).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(refresh, [refresh]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await createCategory(newName);
      if (!res.success) { setError(res.error || "Failed."); return; }
      setNewName("");
      setAdding(false);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setError("");
    setBusy(true);
    try {
      const res = await renameCategory(editingId, editValue);
      if (!res.success) { setError(res.error || "Failed."); return; }
      setEditingId(null);
      refresh();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setError("");
    setBusy(true);
    try {
      const res = await deleteCategory(confirmDelete.id, reassignTo.trim() ? reassignTo : undefined);
      if (!res.success) { setError(res.error || "Failed."); return; }
      setConfirmDelete(null);
      setReassignTo("");
      refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-3 sm:p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/20">
        <div className="flex items-center gap-2.5">
          <Tag size={16} className="text-primary" />
          <h2 className="font-display text-base font-bold text-secondary">Categories</h2>
        </div>
        <button onClick={() => { setAdding(a => !a); setError(""); }} aria-label={adding ? "Cancel" : "Add category"}
          className="flex items-center justify-center w-9 h-9 rounded-lg border border-input text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
          {adding ? <X size={15} /> : <Plus size={15} />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">Shared across events, news and gallery. Renaming updates existing content.</p>

      {adding && (
        <form onSubmit={handleAdd} className="flex items-start gap-2">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="New category name" className={inputCls()} />
          <button type="submit" disabled={busy || !newName.trim()}
            className="shrink-0 flex items-center justify-center min-h-[44px] px-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          </button>
        </form>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">No categories yet.</p>
      ) : (
        <ul className="divide-y divide-border/30">
          {items.map(c => (
            <li key={c.id} className="py-1.5 first:pt-0 last:pb-0">
              {editingId === c.id ? (
                <form onSubmit={handleRename} className="flex items-start gap-2 py-1">
                  <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)} className={inputCls()} />
                  <button type="submit" disabled={busy || !editValue.trim()} aria-label="Save"
                    className="shrink-0 flex items-center justify-center min-h-[44px] w-11 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  </button>
                  <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel"
                    className="shrink-0 flex items-center justify-center min-h-[44px] w-11 rounded-lg border border-input text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="group flex items-center gap-2 min-h-[40px]">
                  <span className="text-sm text-secondary flex-1 truncate">{c.name}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${c.usage > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {c.usage} item{c.usage === 1 ? "" : "s"}
                  </span>
                  <button onClick={() => { setEditingId(c.id); setEditValue(c.name); setError(""); }} aria-label={`Rename ${c.name}`}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-secondary hover:bg-muted transition-all opacity-60 group-hover:opacity-100">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => { setConfirmDelete(c); setReassignTo(""); setError(""); }} aria-label={`Delete ${c.name}`}
                    className="shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-60 group-hover:opacity-100">
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4">
          <div className="bg-card rounded-2xl border border-border/50 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-secondary">Delete &quot;{confirmDelete.name}&quot;?</h3>
              <button type="button" onClick={() => setConfirmDelete(null)} className="text-muted-foreground hover:text-secondary" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {confirmDelete.usage > 0
                ? `${confirmDelete.usage} item${confirmDelete.usage === 1 ? "" : "s"} use this category.`
                : "No content uses this category."}
            </p>
            {confirmDelete.usage > 0 && (
              <div>
                <label className="block text-xs font-medium text-secondary/80 mb-1.5">Reassign those items to (optional)</label>
                <select value={reassignTo} onChange={e => setReassignTo(e.target.value)}
                  className={`${inputCls()} ${!reassignTo ? "text-muted-foreground" : ""}`}>
                  <option value="">Leave as plain text</option>
                  {items.filter(i => i.id !== confirmDelete.id).map(i => (
                    <option key={i.id} value={i.name}>{i.name}</option>
                  ))}
                </select>
                {!reassignTo && (
                  <p className="text-xs text-muted-foreground/60 mt-1">Items keep their current label but it will no longer be a managed category.</p>
                )}
              </div>
            )}
            <div className="flex items-center gap-3 justify-end">
              <button type="button" onClick={() => setConfirmDelete(null)}
                className="h-9 px-4 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-all">Cancel</button>
              <button type="button" onClick={handleDelete} disabled={busy}
                className="h-9 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-all disabled:opacity-50 flex items-center gap-1.5">
                {busy && <Loader2 size={13} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
