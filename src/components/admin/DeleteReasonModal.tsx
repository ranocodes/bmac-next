"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";

const REASON_TEMPLATES = [
  "Duplicate account",
  "Inactive / no longer active",
  "Security concern",
  "No longer part of the organization",
  "Spam or fake account",
  "Data deletion request",
];

interface DeleteReasonModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void | Promise<void>;
}

export default function DeleteReasonModal({
  open,
  title,
  description,
  confirmText = "Delete",
  busy = false,
  onClose,
  onConfirm,
}: DeleteReasonModalProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  function pickTemplate(t: string) {
    setReason(r => (r ? `${r} — ${t}` : t));
  }

  async function handleConfirm() {
    await onConfirm(reason.trim());
    setReason("");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/20 backdrop-blur-sm px-4">
      <div className="bg-card rounded-2xl border border-border/50 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border/30">
          <div>
            <h3 className="font-display text-lg font-bold text-secondary">{title}</h3>
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-secondary hover:bg-muted transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Briefly describe why this account is being deleted…"
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {REASON_TEMPLATES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => pickTemplate(t)}
                  className="px-2.5 py-1 rounded-full border border-input text-[11px] font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 p-5 border-t border-border/30">
          <button onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-input text-sm font-medium text-muted-foreground hover:text-secondary transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={busy}
            className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <Trash2 size={14} />
            {busy ? "Deleting…" : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
