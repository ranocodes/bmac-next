"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox as InboxIcon, Search, Send, MessageSquareReply, Clock, Mail, User, Phone, CalendarDays } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { replyToSubmission } from "@/actions/workflows";

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
  contact: { label: "Contact", color: "text-blue-600 bg-blue-100" },
  member: { label: "Member", color: "text-emerald-600 bg-emerald-100" },
  volunteer: { label: "Volunteer", color: "text-teal-600 bg-teal-100" },
  partner: { label: "Partner", color: "text-violet-600 bg-violet-100" },
  program: { label: "Program", color: "text-indigo-600 bg-indigo-100" },
  donation: { label: "Donation", color: "text-amber-600 bg-amber-100" },
  event_registration: { label: "Event Registration", color: "text-rose-600 bg-rose-100" },
  ticket: { label: "Ticket", color: "text-cyan-600 bg-cyan-100" },
};

const statusMeta: Record<string, { label: string; color: string }> = {
  open: { label: "Open", color: "text-amber-600 bg-amber-100" },
  in_progress: { label: "In Progress", color: "text-blue-600 bg-blue-100" },
  resolved: { label: "Resolved", color: "text-emerald-600 bg-emerald-100" },
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

export default function Inbox({ initialData = [] }: { initialData?: any[] }) {
  const [items, setItems] = useState<WorkflowItem[]>(() => initialData.map(normalize));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<string>("all");
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedId && items.length > 0) setSelectedId(items[0].id);
  }, [items, selectedId]);

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  const filtered = useMemo(() => {
    return items.filter(i => {
      if (filterKind !== "all" && i.kind !== filterKind) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (i.title + " " + i.summary + " " + i.submitterName + " " + i.submitterEmail).toLowerCase().includes(q);
    });
  }, [items, search, filterKind]);

  const unreadCount = items.filter(i => i.status === "open").length;

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

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <InboxIcon size={24} className="text-primary shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Inbox</h1>
          <p className="text-sm text-muted-foreground mt-1">Read and reply to form & email submissions</p>
        </div>
        {unreadCount > 0 && (
          <span className="ml-2 inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            {unreadCount} open
          </span>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[380px] shrink-0 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions..."
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[{ k: "all", label: "All" }, ...Object.entries(kindMeta).map(([k, m]) => ({ k, label: m.label }))].map(f => (
              <button key={f.k} onClick={() => setFilterKind(f.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  filterKind === f.k ? "bg-primary text-primary-foreground border-primary" : "border-input text-muted-foreground hover:text-secondary hover:border-primary/40"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="bg-card rounded-3xl border border-border/50 divide-y divide-border/10 max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <InboxIcon size={40} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{search || filterKind !== "all" ? "No submissions match" : "No submissions yet"}</p>
              </div>
            ) : filtered.map(item => {
              const km = kindMeta[item.kind] || kindMeta.contact;
              const sm = statusMeta[item.status] || statusMeta.open;
              const isSelected = item.id === selectedId;
              return (
                <button key={item.id} onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left px-4 py-4 transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${km.color}`}>{km.label}</span>
                    <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${sm.color}`}>{sm.label}</span>
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

        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="bg-card rounded-3xl border border-border/50 flex flex-col items-center justify-center py-24">
              <MessageSquareReply size={44} className="text-muted-foreground/20 mb-4" />
              <p className="text-sm text-muted-foreground">Select a submission to view</p>
            </div>
          ) : (
            <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${(kindMeta[selected.kind] || kindMeta.contact).color}`}>
                    {(kindMeta[selected.kind] || kindMeta.contact).label}
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${(statusMeta[selected.status] || statusMeta.open).color}`}>
                    {selected.status.replace("_", " ")}
                  </span>
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider bg-muted text-muted-foreground">
                    {selected.priority}
                  </span>
                </div>
                <h2 className="mt-3 font-display text-xl font-bold text-secondary">{selected.title}</h2>
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
              </div>

              <div className="p-6 border-b border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Message</h3>
                <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
                  {selected.details.message || selected.details.notes || selected.summary || "—"}
                </p>
                {selected.details.formLink && (
                  <p className="mt-2 text-xs text-muted-foreground">Form link: <span className="font-mono text-primary break-all">{selected.details.formLink}</span></p>
                )}
              </div>

              <div className="p-6 border-b border-border/50">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">History</h3>
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

              <div className="p-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Reply by email</h3>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={4}
                  placeholder={`Reply to ${selected.submitterEmail || "submitter"}…`}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                <div className="mt-3 flex justify-end">
                  <button onClick={handleReply} disabled={sending || !reply.trim() || !selected.submitterEmail}
                    className="flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all disabled:opacity-50">
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
