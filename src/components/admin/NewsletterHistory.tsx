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

interface NewsletterHistoryProps {
  broadcasts: Broadcast[];
  onCancel: (id: string) => void;
}

export default function NewsletterHistory({ broadcasts, onCancel }: NewsletterHistoryProps) {
  if (broadcasts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
          <Clock size={15} className="text-primary" /> Broadcast History
        </h2>
        <p className="text-sm text-muted-foreground text-center py-4">No broadcasts yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <h2 className="text-sm font-semibold text-secondary flex items-center gap-2 mb-4">
        <Clock size={15} className="text-primary" /> Broadcast History
      </h2>
      <div className="overflow-x-auto">
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
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_STYLES[b.status] || STATUS_STYLES.test}`}>
                    {b.status === "sent" && <CheckCircle2 size={10} />}
                    {b.status === "sending" && <Send size={10} />}
                    {b.status === "aborted" && <Ban size={10} />}
                    {(b.status === "partial" || b.status === "test" || b.status === "scheduled") && <AlertCircle size={10} />}
                    {b.status}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right text-xs text-muted-foreground">
                  {b.sentCount} / {b.recipientCount}
                </td>
                <td className="py-2.5 px-3 text-right text-xs">
                  {b.errorCount > 0 ? (
                    <span className="text-destructive font-bold">{b.errorCount}</span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs text-muted-foreground">
                  {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  {" "}
                  {new Date(b.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {(b.status === "scheduled" || b.status === "sending") && (
                    <button
                      onClick={() => onCancel(b.id)}
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
    </div>
  );
}
