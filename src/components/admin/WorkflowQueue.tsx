"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardList, Search, ArrowRight, ChevronRight } from "lucide-react";
import type { WorkflowKind, WorkflowRecord, WorkflowStatus } from "@/types/cms";

const kindLabels: Record<string, string> = {
  contact: "Contact",
  member: "Membership",
  volunteer: "Volunteer",
  partner: "Partnership",
  program: "School Chapter",
  event_registration: "Event Registration",
  donation: "Donation",
  ticket: "Ticket",
};

const statusStyles: Record<string, string> = {
  open: "bg-emerald-50 text-emerald-700 border-emerald-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  resolved: "bg-slate-50 text-slate-700 border-slate-200",
  closed: "bg-slate-50 text-slate-600 border-slate-200",
};

const priorityStyles: Record<string, string> = {
  low: "bg-slate-50 text-slate-600",
  normal: "bg-slate-50 text-slate-700",
  high: "bg-amber-50 text-amber-700",
  urgent: "bg-rose-50 text-rose-700",
};

export default function WorkflowQueue({
  initialData,
  counts,
}: {
  initialData: WorkflowRecord[];
  counts: { byStatus: Record<string, number>; open: number };
}) {
  const [kind, setKind] = useState<WorkflowKind | "">("");
  const [status, setStatus] = useState<WorkflowStatus | "">("");
  const [search, setSearch] = useState("");

  const filtered = initialData.filter(r => {
    if (kind && r.kind !== kind) return false;
    if (status && r.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.submitterName.toLowerCase().includes(q) ||
        r.submitterEmail.toLowerCase().includes(q) ||
        r.summary.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const kindOptions = Array.from(new Set(initialData.map(r => r.kind)));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <ClipboardList size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Workflow Queue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {counts.open} open item{counts.open === 1 ? "" : "s"} awaiting action
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, name, email..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <select
          value={kind}
          onChange={e => setKind(e.target.value as WorkflowKind | "")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">All kinds</option>
          {kindOptions.map(k => (
            <option key={k} value={k}>{kindLabels[k] || k}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={e => setStatus(e.target.value as WorkflowStatus | "")}
          className="h-10 rounded-lg border border-border bg-card px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="">All statuses</option>
          {(["open", "in_progress", "resolved", "closed"] as WorkflowStatus[]).map(s => (
            <option key={s} value={s}>
              {s.replace("_", " ")} ({counts.byStatus[s] ?? 0})
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <ClipboardList size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search || kind || status ? "No items match your filters" : "No workflow items yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || kind || status ? "Try adjusting your filters" : "Submissions from your forms will appear here"}
          </p>
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map(r => (
              <Link
                key={r.id}
                href={`/admin/workflow/${r.id}`}
                className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-secondary truncate">{r.title}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusStyles[r.status] || statusStyles.open}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{kindLabels[r.kind] || r.kind}</span>
                    <span className="text-xs text-muted-foreground">· {r.submitterName}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>

          <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Title</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Kind</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Submitter</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden lg:table-cell">Priority</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-16">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-secondary">{r.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 max-w-xs">{r.summary}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="inline-block px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                          {kindLabels[r.kind] || r.kind}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div>
                          <p className="font-medium text-secondary">{r.submitterName}</p>
                          <p className="text-xs text-muted-foreground">{r.submitterEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${priorityStyles[r.priority] || priorityStyles.normal}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyles[r.status] || statusStyles.open}`}>
                          {r.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/workflow/${r.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-all"
                          aria-label={`Open ${r.title}`}
                        >
                          <ArrowRight size={15} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
