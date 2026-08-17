"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, User, Mail, CalendarDays, Phone, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { updateWorkflowStatus, replyToSubmission } from "@/actions/workflows";
import StatusBadge from "@/components/admin/StatusBadge";
import type { WorkflowStatus } from "@/types/cms";

interface DetailProps {
  detail: {
    record: {
      id: string;
      kind: string;
      title: string;
      summary: string;
      status: string;
      priority: string;
      submitterName: string;
      submitterEmail: string;
      source: string;
      details: Record<string, any>;
      createdAt: string;
      updatedAt: string;
      lastContactedAt?: string;
    };
    person: {
      person: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
      };
      records: { id: string; kind: string; status: string; createdAt: string }[];
      isAdmin: boolean;
    } | null;
  };
}

function parseDetails(d: unknown): Record<string, any> {
  if (typeof d === "string") {
    try { return JSON.parse(d); } catch { return {}; }
  }
  return (d ?? {}) as Record<string, any>;
}

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

export default function ApplicationReview({ detail }: DetailProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { record, person } = detail;
  const details = parseDetails(record.details);

  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(record.status);

  const history = Array.isArray(details.history) ? details.history : [];

  async function handleMarkResolved() {
    setSaving(true);
    const result = await updateWorkflowStatus(record.id, { status: "resolved" as WorkflowStatus });
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCurrentStatus("resolved");
    toast("Marked as resolved", "success");
  }

  async function handleClose() {
    setSaving(true);
    const result = await updateWorkflowStatus(record.id, { status: "closed" as WorkflowStatus });
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCurrentStatus("closed");
    toast("Closed", "success");
  }

  async function handleReply() {
    if (!reply.trim()) return;
    setSending(true);
    const result = await replyToSubmission(record.id, { body: reply.trim() });
    setSending(false);
    if (result.error) { toast(result.error, "error"); return; }
    setReply("");
    toast("Reply sent to " + record.submitterEmail, "success");
  }

  return (
    <div className="space-y-6 max-w-[900px]">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors"
      >
        <ArrowLeft size={15} /> Back to inbox
      </button>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={currentStatus} size="md" />
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-muted text-muted-foreground">
            {record.kind}
          </span>
          <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider bg-muted text-muted-foreground">
            {record.priority}
          </span>
        </div>

        <h1 className="mt-4 font-display text-2xl font-bold text-secondary">{record.title || "Untitled"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{record.summary}</p>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {record.submitterName && (
            <p className="flex items-center gap-2 text-secondary"><User size={14} className="text-muted-foreground" /> {record.submitterName}</p>
          )}
          {record.submitterEmail && (
            <p className="flex items-center gap-2 text-secondary truncate"><Mail size={14} className="text-muted-foreground" /> {record.submitterEmail}</p>
          )}
          {details.phone && (
            <p className="flex items-center gap-2 text-secondary"><Phone size={14} className="text-muted-foreground" /> {details.phone}</p>
          )}
          <p className="flex items-center gap-2 text-secondary"><CalendarDays size={14} className="text-muted-foreground" /> Submitted {new Date(record.createdAt).toLocaleString()}</p>
        </div>

        {person?.person && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Person Record</p>
            <p className="text-sm text-secondary">
              {person.person.firstName} {person.person.lastName}
              {person.isAdmin && <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">Admin</span>}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{person.person.email} · {person.person.phone || "No phone"}</p>
            {person.records.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">{person.records.length} total records for this person</p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {currentStatus !== "resolved" && (
            <button
              onClick={handleMarkResolved}
              disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <CheckCircle size={15} /> {saving ? "Saving…" : "Mark Resolved"}
            </button>
          )}
          {currentStatus !== "closed" && (
            <button
              onClick={handleClose}
              disabled={saving}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-muted text-muted-foreground text-sm font-semibold hover:bg-muted/80 transition-all disabled:opacity-50"
            >
              <XCircle size={15} /> {saving ? "Saving…" : "Close"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Message</h3>
        <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
          {details.message || details.notes || record.summary || "—"}
        </p>
        {details.formLink && (
          <p className="mt-2 text-xs text-muted-foreground">Form link: <span className="font-mono text-primary break-all">{details.formLink}</span></p>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">History</h3>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((h: any, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${h.type === "reply" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                  <Send size={13} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {h.type === "reply" ? "Replied" : h.type === "status" ? "Status change" : "Note"} · {h.by || "admin"} · {h.at ? new Date(h.at).toLocaleString() : ""}
                  </p>
                  <p className="mt-0.5 text-sm text-secondary">{h.note}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No history yet.</p>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Reply by email</h3>
        <textarea
          value={reply}
          onChange={e => setReply(e.target.value)}
          rows={4}
          placeholder={`Reply to ${record.submitterEmail || "submitter"}…`}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button onClick={handleReply} disabled={sending || !reply.trim() || !record.submitterEmail}
            className="flex items-center gap-2 h-11 px-5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary transition-all disabled:opacity-50">
            <Send size={15} />
            {sending ? "Sending…" : "Send Reply"}
          </button>
        </div>
      </div>
    </div>
  );
}
