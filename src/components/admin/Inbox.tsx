"use client";

import { useMemo, useState } from "react";
import { Inbox as InboxIcon, Search, Send, MessageSquareReply, Clock, Mail, User, Phone, CalendarDays, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import StatusBadge from "@/components/admin/StatusBadge";
import { replyToSubmission, updateWorkflowStatus, deleteWorkflow } from "@/actions/workflows";
import type { WorkflowStatus, WorkflowPriority } from "@/types/cms";

interface WorkflowItem {
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
}

const kindMeta: Record<string, { label: string; color: string }> = {
  contact: { label: "Contact", color: "text-blue-700 bg-blue-50" },
  member: { label: "Member", color: "text-emerald-700 bg-emerald-50" },
  volunteer: { label: "Volunteer", color: "text-teal-700 bg-teal-50" },
  partner: { label: "Partner", color: "text-violet-700 bg-violet-50" },
  program: { label: "Program", color: "text-indigo-700 bg-indigo-50" },
  donation: { label: "Donation", color: "text-amber-700 bg-amber-50" },
  event_registration: { label: "Event Registration", color: "text-rose-700 bg-rose-50" },
  ticket: { label: "Ticket", color: "text-cyan-700 bg-cyan-50" },
};

const STREAMS = [
  { key: "all", label: "All" },
  { key: "general", label: "General Inquiries", kinds: ["contact", "partner", "donation"] },
  { key: "membership", label: "Club Membership", kinds: ["member", "volunteer"] },
  { key: "cohort", label: "Cohort Applications", kinds: ["program"] },
] as const;

const statusMeta: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-amber-700 bg-amber-50" },
  in_progress: { label: "In Progress", color: "text-blue-700 bg-blue-50" },
  resolved: { label: "Resolved", color: "text-emerald-700 bg-emerald-50" },
  closed: { label: "Closed", color: "text-muted-foreground bg-muted" },
};

function parseDetails(d: unknown): Record<string, any> {
  if (typeof d === "string") {
    try { return JSON.parse(d); } catch { return {}; }
  }
  return (d ?? {}) as Record<string, any>;
}

function normalize(row: any): WorkflowItem {
  return {
    id: row.id,
    kind: row.kind || "contact",
    title: row.title || "",
    summary: row.summary || "",
    status: row.status || "open",
    priority: row.priority || "normal",
    submitterName: row.submitter_name || "",
    submitterEmail: row.submitter_email || "",
    source: row.source || "",
    details: parseDetails(row.details),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastContactedAt: row.last_contacted_at || undefined,
  };
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

export default function Inbox({ initialData = [], stats }: { initialData?: any[]; stats?: { total: number; open: number; byKind: Record<string, number>; byStatus: Record<string, number> } }) {
  const [items, setItems] = useState<WorkflowItem[]>(() => initialData.map(normalize));
  const [selectedId, setSelectedId] = useState<string | null>(() => (initialData.length ? normalize(initialData[0]).id : null));
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<string>("all");
  const [activeStream, setActiveStream] = useState<string>("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  const filtered = useMemo(() => {
    const streamDef = STREAMS.find(s => s.key === activeStream);
    return items.filter(i => {
      if (streamDef && "kinds" in streamDef && !(streamDef as any).kinds.includes(i.kind)) return false;
      if (filterKind !== "all" && i.kind !== filterKind) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (i.title + " " + i.summary + " " + i.submitterName + " " + i.submitterEmail).toLowerCase().includes(q);
    });
  }, [items, search, filterKind, activeStream]);

  const unreadCount = items.filter(i => i.status === "open").length;

  const streamOpenCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of STREAMS) {
      if (s.key === "all") {
        counts[s.key] = items.filter(i => i.status === "open").length;
      } else if ("kinds" in s) {
        counts[s.key] = items.filter(i => i.status === "open" && (s as any).kinds.includes(i.kind)).length;
      }
    }
    return counts;
  }, [items]);

  async function handleReply() {
    if (!selected || !reply.trim()) return;
    setSending(true);
    const result = await replyToSubmission(selected.id, { body: reply.trim() });
    setSending(false);
    if (result.error) { toast(result.error, "error"); return; }
    const history = Array.isArray(selected.details.history) ? selected.details.history : [];
    const entry = { type: "reply", by: "admin", at: result.repliedAt || new Date().toISOString(), note: reply.trim() };
    setItems(prev => prev.map(i => i.id === selected.id ? {
      ...i,
      lastContactedAt: result.repliedAt || i.lastContactedAt,
      details: { ...i.details, history: [...history, entry] },
    } : i));
    setReply("");
    toast("Reply sent to " + selected.submitterEmail, "success");
  }

  const [statusDraft, setStatusDraft] = useState<Record<string, string>>({});
  const [priorityDraft, setPriorityDraft] = useState<Record<string, string>>({});

  async function handleSaveStatus() {
    if (!selected) return;
    setSaving(true);
    const status = (statusDraft[selected.id] ?? selected.status) as WorkflowStatus;
    const priority = (priorityDraft[selected.id] ?? selected.priority) as WorkflowPriority;
    const result = await updateWorkflowStatus(selected.id, { status, priority });
    setSaving(false);
    if (result.error) { toast(result.error, "error"); return; }
    setItems(prev => prev.map(i => i.id === selected.id ? { ...i, status: status as string, priority: priority as string } : i));
    setStatusDraft(p => { const c = { ...p }; delete c[selected.id]; return c; });
    setPriorityDraft(p => { const c = { ...p }; delete c[selected.id]; return c; });
    toast("Status updated", "success");
  }

  async function handleDelete() {
    if (!selected) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    const result = await deleteWorkflow(selected.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (result.error) { toast(result.error, "error"); return; }
    const removedId = selected.id;
    setItems(prev => prev.filter(i => i.id !== removedId));
    setSelectedId(items.length > 1 ? (items.find(i => i.id !== removedId)?.id ?? null) : null);
    setMobileView("list");
    toast("Submission deleted", "success");
  }

  const detailHidden = mobileView === "list";
  const listHidden = mobileView === "detail";

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <InboxIcon size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Inbox</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Read and reply to form & email submissions</p>
        </div>
        {unreadCount > 0 && (
          <span className="ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold">
            {unreadCount} open
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`w-full lg:w-[360px] shrink-0 space-y-4 ${listHidden ? "hidden lg:block" : ""}`}>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="flex gap-1.5">
            {STREAMS.map(s => (
              <button key={s.key} onClick={() => { setActiveStream(s.key); setFilterKind("all"); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeStream === s.key ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border text-secondary hover:border-primary/40"
                }`}>
                {s.label}
                {streamOpenCounts[s.key] > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                    {streamOpenCounts[s.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ k: "all", label: "All" }, ...Object.entries(kindMeta).map(([k, m]) => ({ k, label: m.label }))].map(f => (
              <button key={f.k} onClick={() => setFilterKind(f.k)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                  filterKind === f.k ? "bg-secondary text-secondary-foreground border-secondary" : "border-border text-muted-foreground hover:text-secondary hover:border-primary/40"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <InboxIcon size={36} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{search || filterKind !== "all" || activeStream !== "all" ? "No submissions match" : "No submissions yet"}</p>
              </div>
            ) : filtered.map(item => {
              const km = kindMeta[item.kind] || kindMeta.contact;
              const sm = statusMeta[item.status] || statusMeta.open;
              const isSelected = item.id === selectedId;
              return (
                <button key={item.id} onClick={() => { setSelectedId(item.id); setMobileView("detail"); }}
                  className={`w-full text-left px-4 py-4 border-b border-border/50 last:border-0 transition-colors ${isSelected ? "bg-muted/60" : "hover:bg-muted/40"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={item.kind} />
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 text-sm font-medium text-secondary line-clamp-1">{item.title || "Untitled"}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{item.summary}</p>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70 flex items-center gap-1">
                    <Clock size={11} /> {timeAgo(item.createdAt)}
                    {item.lastContactedAt && <span className="text-primary">· replied {timeAgo(item.lastContactedAt)}</span>}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`flex-1 min-w-0 ${detailHidden ? "hidden lg:block" : ""}`}>
          {!selected ? (
            <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-24">
              <MessageSquareReply size={40} className="text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">Select a submission to view</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-5 lg:p-6 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <button onClick={() => setMobileView("list")}
                    className="lg:hidden inline-flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-colors">
                    <ArrowLeft size={15} /> All
                  </button>
                  <StatusBadge status={selected.kind} />
                  <StatusBadge status={selected.status} />
                  <StatusBadge status={selected.priority} />
                </div>
                <h2 className="mt-4 font-display text-xl font-bold text-secondary">{selected.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{selected.summary}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {selected.submitterName && (
                    <p className="flex items-center gap-2 text-secondary"><User size={14} className="text-muted-foreground" /> {selected.submitterName}</p>
                  )}
                  {selected.submitterEmail && (
                    <p className="flex items-center gap-2 text-secondary truncate"><Mail size={14} className="text-muted-foreground" /> {selected.submitterEmail}</p>
                  )}
                  {selected.details.phone && (
                    <p className="flex items-center gap-2 text-secondary"><Phone size={14} className="text-muted-foreground" /> {selected.details.phone}</p>
                  )}
                  <p className="flex items-center gap-2 text-secondary"><CalendarDays size={14} className="text-muted-foreground" /> Submitted {new Date(selected.createdAt).toLocaleString()}</p>
                </div>

                <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-border/60 pt-5">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Status</label>
                    <select
                      value={statusDraft[selected.id] ?? selected.status}
                      onChange={e => setStatusDraft(p => ({ ...p, [selected.id]: e.target.value }))}
                      className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {["open", "in_progress", "resolved", "closed"].map(s => (
                        <option key={s} value={s}>{s.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1.5">Priority</label>
                    <select
                      value={priorityDraft[selected.id] ?? selected.priority}
                      onChange={e => setPriorityDraft(p => ({ ...p, [selected.id]: e.target.value }))}
                      className="h-10 px-3 rounded-lg border border-border bg-background text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      {["low", "normal", "high", "urgent"].map(pr => (
                        <option key={pr} value={pr}>{pr}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={handleSaveStatus} disabled={saving}
                    className="h-10 px-4 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary transition-all disabled:opacity-50">
                    {saving ? "Saving…" : "Save Status"}
                  </button>
                  <button onClick={handleDelete} disabled={deleting}
                    className={`ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-semibold border transition-all disabled:opacity-50 ${
                      confirmDelete ? "bg-destructive text-destructive-foreground border-destructive" : "border-border text-destructive hover:bg-destructive/5"
                    }`}>
                    <Trash2 size={15} />
                    {deleting ? "Deleting…" : confirmDelete ? "Confirm delete?" : "Delete"}
                  </button>
                </div>
              </div>

              <div className="p-5 lg:p-6 border-b border-border/60">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Message</h3>
                <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
                  {selected.details.message || selected.details.notes || selected.summary || "—"}
                </p>
                {selected.details.formLink && (
                  <p className="mt-2 text-xs text-muted-foreground">Form link: <span className="font-mono text-primary break-all">{selected.details.formLink}</span></p>
                )}
              </div>

              <div className="p-5 lg:p-6 border-b border-border/60">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">History</h3>
                {Array.isArray(selected.details.history) && selected.details.history.length > 0 ? (
                  <div className="space-y-3">
                    {selected.details.history.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${h.type === "reply" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          <MessageSquareReply size={13} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {h.type === "reply" ? "Replied" : "Note"} · {h.by || "admin"} · {h.at ? new Date(h.at).toLocaleString() : ""}
                          </p>
                          <p className="mt-0.5 text-sm text-secondary">{h.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No replies yet.</p>
                )}
              </div>

              <div className="p-5 lg:p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3">Reply by email</h3>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  placeholder={`Reply to ${selected.submitterEmail || "submitter"}…`}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <button onClick={handleReply} disabled={sending || !reply.trim() || !selected.submitterEmail}
                    className="flex items-center gap-2 h-11 px-5 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-primary transition-all disabled:opacity-50">
                    <Send size={15} />
                    {sending ? "Sending…" : "Send Reply"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
