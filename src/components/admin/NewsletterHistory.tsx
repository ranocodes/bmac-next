"use client";

import { CheckCircle2, AlertCircle, Clock, Send, Ban } from "lucide-react";
import type { Broadcast } from "@/actions/newsletter-admin";

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-50 border-emerald-200 text-emerald-800",
  partial: "bg-amber-50 border-amber-200 text-amber-800",
  sending: "bg-blue-50 border-blue-200 text-blue-800",
  scheduled: "bg-purple-50 border-purple-200 text-purple-800",
  aborted: "bg-gray-50 border-gray-200 text-gray-600",
  test: "bg-slate-50 border-slate-200 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[status] || STATUS_STYLES.test}`}>
      {status === "sent" && <CheckCircle2 size={10} />}
      {status === "sending" && <Send size={10} />}
      {status === "aborted" && <Ban size={10} />}
      {(status === "partial" || status === "test" || status === "scheduled") && <AlertCircle size={10} />}
      {status}
    </span>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

interface NewsletterHistoryProps {
  broadcasts: Broadcast[];
  onCancel: (id: string) => void;
}

export default function NewsletterHistory({ broadcasts, onCancel }: NewsletterHistoryProps) {
  if (broadcasts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
        <h2 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <Clock size={15} className="text-primary" /> Broadcast History
        </h2>
        <p className="text-sm text-muted-foreground text-center py-4">No broadcasts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
      <h2 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
        <Clock size={15} className="text-primary" /> Broadcast History
      </h2>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</th>
              <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Sent / Total</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Errors</th>
              <th className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Date</th>
              <th className="text-right py-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {broadcasts.map((b) => (
              <tr key={b.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="py-2.5 px-3 font-medium text-secondary truncate max-w-[200px]">{b.subject}</td>
                <td className="py-2.5 px-3"><StatusBadge status={b.status} /></td>
                <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">{b.sentCount} / {b.recipientCount}</td>
                <td className="py-2.5 px-3 text-right text-xs">
                  {b.errorCount > 0 ? (
                    <span className="text-destructive font-bold">{b.errorCount}</span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">{formatDate(b.createdAt)} {formatTime(b.createdAt)}</td>
                <td className="py-2.5 px-3 text-right">
                  {(b.status === "scheduled" || b.status === "sending") && (
                    <button
                      onClick={() => { if (window.confirm(`Cancel broadcast "${b.subject}"?`)) onCancel(b.id); }}
                      title="Cancel broadcast"
                      className="text-[10px] font-bold text-destructive hover:text-destructive/80 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {broadcasts.map((b) => (
          <div key={b.id} className="border border-border/50 rounded-lg p-3 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-secondary truncate flex-1 min-w-0">{b.subject}</p>
              <StatusBadge status={b.status} />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{b.sentCount} / {b.recipientCount} sent</span>
              {b.errorCount > 0 && <span className="text-destructive font-bold">{b.errorCount} errors</span>}
              <span>{formatDate(b.createdAt)} {formatTime(b.createdAt)}</span>
            </div>
            {(b.status === "scheduled" || b.status === "sending") && (
              <div className="flex justify-end">
                <button
                  onClick={() => { if (window.confirm(`Cancel broadcast "${b.subject}"?`)) onCancel(b.id); }}
                  className="text-[10px] font-bold text-destructive hover:text-destructive/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
