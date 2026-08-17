"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Clock, CheckCircle, XCircle, Ban, Filter, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cancelSequence } from "@/actions/email-sequences";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/admin/StatusBadge";
import type { EmailSequenceRow } from "@/actions/email-sequences";

const statusConfig: Record<string, { label: string; icon: typeof Mail; color: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-amber-600 bg-amber-50" },
  sent: { label: "Sent", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
  failed: { label: "Failed", icon: XCircle, color: "text-red-600 bg-red-50" },
  cancelled: { label: "Cancelled", icon: Ban, color: "text-muted-foreground bg-muted" },
};

const sequenceTypeLabels: Record<string, string> = {
  welcome: "Welcome",
  renewal: "Renewal",
  "re-engagement": "Re-engagement",
};

function formatDate(ts: string) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function EmailSequencesAdmin({
  sequences,
  total,
  stats,
  currentPage,
  limit,
  currentStatus,
  currentType,
}: {
  sequences: EmailSequenceRow[];
  total: number;
  stats: { total: number; pending: number; sent: number; failed: number; cancelled: number };
  currentPage: number;
  limit: number;
  currentStatus?: string;
  currentType?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [cancelling, setCancelling] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (overrides.status) params.set("status", overrides.status);
    if (overrides.type) params.set("type", overrides.type);
    if (overrides.page) params.set("page", overrides.page);
    return `/admin/email-sequences?${params.toString()}`;
  }

  async function handleCancel(id: string) {
    setCancelling(id);
    const result = await cancelSequence(id);
    setCancelling(null);
    toast("Sequence cancelled", "success");
    router.refresh();
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary">Email Sequences</h1>
        <p className="text-sm text-muted-foreground mt-1">Automated email sequences for welcome, renewal, and re-engagement flows</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-secondary" },
          { label: "Pending", value: stats.pending, color: "text-amber-600" },
          { label: "Sent", value: stats.sent, color: "text-emerald-600" },
          { label: "Failed", value: stats.failed, color: "text-red-600" },
          { label: "Cancelled", value: stats.cancelled, color: "text-muted-foreground" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-muted-foreground" />
        <Link href={buildUrl({ status: undefined, type: currentType, page: "1" })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!currentStatus ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          All
        </Link>
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <Link key={key} href={buildUrl({ status: key, type: currentType, page: "1" })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${currentStatus === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {cfg.label}
          </Link>
        ))}
        <span className="text-border mx-1">|</span>
        <Link href={buildUrl({ status: currentStatus, type: undefined, page: "1" })}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!currentType ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          All types
        </Link>
        {Object.entries(sequenceTypeLabels).map(([key, label]) => (
          <Link key={key} href={buildUrl({ status: currentStatus, type: key, page: "1" })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${currentType === key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {label}
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {sequences.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mail size={48} className="text-muted-foreground/20 mb-4" />
            <p className="text-sm font-medium text-secondary">No sequences found</p>
            <p className="text-xs text-muted-foreground mt-1">No email sequences match the current filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Template</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Scheduled</th>
                  <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Sent</th>
                  <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {sequences.map(seq => {
                  const sc = statusConfig[seq.status] || statusConfig.pending;
                  const Icon = sc.icon;
                  return (
                    <tr key={seq.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                          <Zap size={12} className="text-primary" />
                          {sequenceTypeLabels[seq.sequence_type] || seq.sequence_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-secondary font-medium">{seq.email}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{seq.template_type}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={seq.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(seq.scheduled_at)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{seq.sent_at ? formatDate(seq.sent_at) : "—"}</td>
                      <td className="px-4 py-3 text-right">
                        {seq.status === "pending" && (
                          <button onClick={() => handleCancel(seq.id)} disabled={cancelling === seq.id}
                            className="text-xs font-medium text-destructive hover:underline disabled:opacity-50">
                            {cancelling === seq.id ? "Cancelling…" : "Cancel"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {(currentPage - 1) * limit + 1}–{Math.min(currentPage * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <Link href={buildUrl({ status: currentStatus, type: currentType, page: String(Math.max(1, currentPage - 1)) })}
              className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border text-xs font-medium transition-all ${currentPage <= 1 ? "opacity-40 pointer-events-none" : "hover:bg-muted/40"}`}>
              <ChevronLeft size={14} /> Prev
            </Link>
            <Link href={buildUrl({ status: currentStatus, type: currentType, page: String(Math.min(totalPages, currentPage + 1)) })}
              className={`inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-border text-xs font-medium transition-all ${currentPage >= totalPages ? "opacity-40 pointer-events-none" : "hover:bg-muted/40"}`}>
              Next <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
