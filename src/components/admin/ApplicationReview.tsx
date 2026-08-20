"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, CalendarDays, Phone, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { acceptApplicationWorkflow, rejectApplicationWorkflow } from "@/actions/workflows";
import { sendPublicCredentials } from "@/actions/programs";
import StatusBadge from "@/components/admin/StatusBadge";

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
    answers?: Record<string, unknown> | null;
  };
}

function parseDetails(d: unknown): Record<string, any> {
  if (typeof d === "string") {
    try { return JSON.parse(d); } catch { return {}; }
  }
  return (d ?? {}) as Record<string, any>;
}

export default function ApplicationReview({ detail }: DetailProps) {
  const router = useRouter();
  const { toast, confirm } = useToast();
  const { record, person } = detail;
  const details = parseDetails(record.details);
  const answers = detail.answers as Record<string, unknown> | null | undefined;

  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(record.status);

  async function handleAccept() {
    const ok = await confirm(
      `Accept this application and send an acceptance email to ${record.submitterEmail || "the applicant"}?`,
      { confirmText: "Accept & Send Email", variant: "default" }
    );
    if (!ok) return;

    setSaving(true);
    const result = await acceptApplicationWorkflow(record.id);
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCurrentStatus("resolved");
    toast("Application accepted — email sent", "success");
  }

  async function handleReject() {
    const ok = await confirm(
      `Reject this application? Choose whether to send a rejection email.`,
      { confirmText: "Reject without email", cancelText: "Cancel" }
    );
    if (!ok) return;

    setSaving(true);
    const result = await rejectApplicationWorkflow(record.id, { sendEmail: false });
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCurrentStatus("closed");
    toast("Application rejected", "success");
  }

  async function handleRejectWithEmail() {
    const ok = await confirm(
      `Reject this application and send a rejection email to ${record.submitterEmail || "the applicant"}?`,
      { confirmText: "Reject & Send Email" }
    );
    if (!ok) return;

    setSaving(true);
    const result = await rejectApplicationWorkflow(record.id, { sendEmail: true });
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setCurrentStatus("closed");
    toast("Application rejected — email sent", "success");
  }

  const [sendingLogin, setSendingLogin] = useState(false);
  async function handleSendLogin() {
    if (!person?.person?.id) { toast("No person record found", "error"); return; }
    setSendingLogin(true);
    const programId = details.programId || undefined;
    const result = await sendPublicCredentials({ personId: person.person.id, programId });
    setSendingLogin(false);
    if (result.error) { toast(result.error, "error"); return; }
    toast("Portal login sent to " + record.submitterEmail, "success");
  }

  const renderAnswer = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-muted-foreground">Not provided</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">Not provided</span>;
      return (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((v, i) => (
            <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-secondary text-xs font-medium">
              {String(v)}
            </span>
          ))}
        </div>
      );
    }
    return <span className="text-secondary whitespace-pre-wrap">{String(value)}</span>;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-secondary transition-colors"
      >
        <ArrowLeft size={15} /> Back to inbox
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary">{record.title || "Untitled"}</h1>
          <p className="text-sm text-muted-foreground">{record.submitterName || record.submitterEmail || "Unknown applicant"}</p>
        </div>
        <StatusBadge status={currentStatus} size="md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm bg-card p-4 rounded-xl border border-border">
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

      <div className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
        <h2 className="text-lg font-bold text-secondary border-b border-border/50 pb-2 mb-6">Application Answers</h2>
        
        {answers && Object.keys(answers).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(answers).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-secondary">{key.replace(/[_-]/g, " ")}</h3>
                <div className="text-sm">
                  {renderAnswer(value)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-secondary">Message / Notes</h3>
                <div className="text-sm text-secondary whitespace-pre-wrap">{details.message || details.notes || record.summary || "No answers provided."}</div>
             </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border p-6 md:p-8">
        <h2 className="text-lg font-bold text-secondary border-b border-border/50 pb-2 mb-6">Decision</h2>
        
        {currentStatus === "closed" ? (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center justify-center">
            Application rejected
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAccept}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
            >
              <CheckCircle size={18} /> {saving ? "Saving…" : "Accept"}
            </button>
            <button
              onClick={handleReject}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg border border-destructive/30 text-destructive text-sm font-bold hover:bg-destructive/5 transition-all disabled:opacity-50"
            >
              <XCircle size={18} /> {saving ? "Saving…" : "Reject"}
            </button>
            <button
              onClick={handleRejectWithEmail}
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold hover:bg-destructive/90 transition-all disabled:opacity-50"
            >
              <XCircle size={18} /> {saving ? "Saving…" : "Reject & Email"}
            </button>
          </div>
        )}
        
        {currentStatus === "resolved" && record.kind === "program" && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <button
              onClick={handleSendLogin}
              disabled={sendingLogin}
              className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {sendingLogin ? "Sending…" : "Send Student Portal Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
