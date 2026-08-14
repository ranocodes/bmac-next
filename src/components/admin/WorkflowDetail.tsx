"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCheck,
  Send,
  User,
  Mail,
  Phone,
  CalendarDays,
  Clock,
  MessageSquareReply,
  Flag,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import {
  updateWorkflowStatus,
  setLastContacted,
  replyToSubmission,
} from "@/actions/workflows";
import type { WorkflowPriority, WorkflowRecord, WorkflowStatus } from "@/types/cms";

const statusOptions: WorkflowStatus[] = ["open", "in_progress", "resolved", "closed"];
const priorityOptions: WorkflowPriority[] = ["low", "normal", "high", "urgent"];

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default function WorkflowDetail({
  record,
  person,
}: {
  record: WorkflowRecord;
  person: {
    person: { id: string; firstName: string; lastName: string; email: string; phone: string };
    records: unknown[];
    isAdmin: boolean;
  } | null;
}) {
  const [status, setStatus] = useState<WorkflowStatus>(record.status);
  const [priority, setPriority] = useState<WorkflowPriority>(record.priority);
  const [assignee, setAssignee] = useState(record.assigneeEmail);
  const [outcome, setOutcome] = useState(record.outcome);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const history = Array.isArray(record.details?.history) ? record.details.history : [];
  const personName = person
    ? [person.person.firstName, person.person.lastName].filter(Boolean).join(" ") || person.person.email
    : "";

  async function handleSave() {
    setSaving(true);
    const res = await updateWorkflowStatus(record.id, {
      status,
      priority,
      assigneeEmail: assignee.trim(),
      outcome: outcome.trim(),
      note: note.trim(),
    });
    setSaving(false);
    if (res.error) { toast(res.error, "error"); return; }
    setNote("");
    toast("Workflow updated", "success");
  }

  async function handleContacted() {
    const res = await setLastContacted(record.id);
    if (res.error) { toast(res.error, "error"); return; }
    toast("Marked as contacted", "success");
  }

  async function handleReply() {
    if (!reply.trim()) return;
    setSending(true);
    const res = await replyToSubmission(record.id, { body: reply.trim() });
    setSending(false);
    if (res.error) { toast(res.error, "error"); return; }
    setReply("");
    toast("Reply sent to " + record.submitterEmail, "success");
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Link href="/admin/workflow" className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-card text-muted-foreground hover:text-secondary hover:border-border transition-all">
          <ArrowLeft size={17} />
        </Link>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-secondary">{record.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{record.id}</p>
        </div>
        <span className={`ml-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
          status === "resolved" || status === "closed"
            ? "bg-emerald-50 text-emerald-700"
            : status === "in_progress"
              ? "bg-blue-50 text-blue-700"
              : "bg-amber-50 text-amber-700"
        }`}>
          {status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Summary</h3>
            <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
              {String(record.details.message || record.details.notes || record.summary || "—")}
            </p>
            {typeof record.details.formLink === "string" && record.details.formLink && (
              <p className="mt-2 text-xs text-muted-foreground">Form link: <span className="font-mono text-primary break-all">{record.details.formLink}</span></p>
            )}
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-4">Update Workflow</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</span>
                <select value={status} onChange={e => setStatus(e.target.value as WorkflowStatus)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Priority</span>
                <select value={priority} onChange={e => setPriority(e.target.value as WorkflowPriority)}
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  {priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Assignee email</span>
                <input type="email" value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="admin@bmacjos.org"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Outcome</span>
                <input type="text" value={outcome} onChange={e => setOutcome(e.target.value)} placeholder="How was this resolved?"
                  className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Add a note</span>
                <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Note for the record…"
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                <CheckCheck size={15} /> {saving ? "Saving…" : "Save Changes"}
              </button>
              <button onClick={handleContacted}
                className="flex items-center gap-2 h-11 px-5 rounded-xl border border-border/60 text-sm font-semibold text-secondary hover:bg-muted/60 transition-all">
                <Clock size={15} /> Mark as contacted
              </button>
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Reply by email</h3>
            <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
              placeholder={`Reply to ${record.submitterEmail || "submitter"}…`}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
            <div className="mt-3 flex justify-end">
              <button onClick={handleReply} disabled={sending || !reply.trim() || !record.submitterEmail}
                className="flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
                <Send size={15} /> {sending ? "Sending…" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              {record.submitterName && (
                <p className="flex items-center gap-2 text-secondary"><User size={14} className="text-muted-foreground shrink-0" /> {record.submitterName}</p>
              )}
              {record.submitterEmail && (
                <p className="flex items-center gap-2 text-secondary truncate"><Mail size={14} className="text-muted-foreground shrink-0" /> {record.submitterEmail}</p>
              )}
              {String(record.details.phone || "") && (
                <p className="flex items-center gap-2 text-secondary"><Phone size={14} className="text-muted-foreground shrink-0" /> {String(record.details.phone)}</p>
              )}
              <p className="flex items-center gap-2 text-secondary"><Flag size={14} className="text-muted-foreground shrink-0" /> {record.kind.replace("_", " ")}</p>
              <p className="flex items-center gap-2 text-secondary"><CalendarDays size={14} className="text-muted-foreground shrink-0" /> Submitted {timeAgo(record.createdAt)}</p>
              {record.lastContactedAt && (
                <p className="flex items-center gap-2 text-secondary"><Clock size={14} className="text-muted-foreground shrink-0" /> Contacted {timeAgo(record.lastContactedAt)}</p>
              )}
              {person && (
                <Link href={`/admin/people/${person.person.id}`} className="flex items-center gap-2 text-primary font-semibold hover:underline">
                  <ExternalLink size={14} className="shrink-0" /> View {personName || "person"} profile
                </Link>
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-4">History</h3>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((h: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${h.type === "reply" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <MessageSquareReply size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        {h.type === "reply" ? "Replied" : h.type === "status" ? "Status change" : h.type === "contact" ? "Contacted" : "Note"} · {h.by || "admin"} · {h.at ? new Date(h.at).toLocaleString() : ""}
                      </p>
                      <p className="mt-0.5 text-sm text-secondary break-words">{h.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
