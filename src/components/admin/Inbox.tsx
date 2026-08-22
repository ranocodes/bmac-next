"use client";

import { useMemo, useState } from "react";
import { Inbox as InboxIcon, Search, MessageSquareReply, Clock, Mail, User, Phone, CalendarDays, ArrowLeft, FileText, MessageCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { deleteWorkflow } from "@/actions/workflows";

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

const kindMeta: Record<string, { label: string; color: string; bg: string }> = {
  contact: { label: "Contact", color: "text-blue-700", bg: "bg-blue-50" },
  member: { label: "Member", color: "text-emerald-700", bg: "bg-emerald-50" },
  volunteer: { label: "Volunteer", color: "text-teal-700", bg: "bg-teal-50" },
  partner: { label: "Partner", color: "text-violet-700", bg: "bg-violet-50" },
  program: { label: "Program", color: "text-indigo-700", bg: "bg-indigo-50" },
  donation: { label: "Donation", color: "text-amber-700", bg: "bg-amber-50" },
  event_registration: { label: "Event Reg", color: "text-rose-700", bg: "bg-rose-50" },
  ticket: { label: "Ticket", color: "text-cyan-700", bg: "bg-cyan-50" },
};

const STREAMS = [
  { key: "all", label: "All" },
  { key: "applications", label: "Applications", kinds: ["program", "volunteer", "member"] },
  { key: "program", label: "Cohort", kinds: ["program"] },
  { key: "volunteer", label: "Volunteer", kinds: ["volunteer"] },
  { key: "member", label: "Membership", kinds: ["member"] },
] as const;

const statusMeta: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-amber-700", bg: "bg-amber-50" },
  in_progress: { label: "In Progress", color: "text-blue-700", bg: "bg-blue-50" },
  resolved: { label: "Resolved", color: "text-emerald-700", bg: "bg-emerald-50" },
  closed: { label: "Closed", color: "text-muted-foreground", bg: "bg-muted" },
};

function parseDetails(d: unknown): Record<string, any> {
  if (typeof d === "string") { try { return JSON.parse(d); } catch { return {}; } }
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
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

export default function Inbox({ initialData = [] }: { initialData?: any[]; stats?: any }) {
  const [items, setItems] = useState<WorkflowItem[]>(() => initialData.map(normalize));
  const [selectedId, setSelectedId] = useState<string | null>(() => (initialData.length ? normalize(initialData[0]).id : null));
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [search, setSearch] = useState("");
  const [activeStream, setActiveStream] = useState<string>("all");
  const [showProcessed, setShowProcessed] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  const filtered = useMemo(() => {
    const streamDef = STREAMS.find(s => s.key === activeStream);
    return items.filter(i => {
      if (!showProcessed && (i.status === "resolved" || i.status === "closed")) return false;
      if (streamDef && "kinds" in streamDef && !(streamDef as any).kinds.includes(i.kind)) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (i.title + " " + i.summary + " " + i.submitterName + " " + i.submitterEmail).toLowerCase().includes(q);
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [items, search, activeStream, showProcessed]);

  const unreadCount = items.filter(i => i.status === "open").length;

  const streamCounts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const s of STREAMS) {
      if (s.key === "all") c[s.key] = items.filter(i => i.status === "open").length;
      else if ("kinds" in s) c[s.key] = items.filter(i => i.status === "open" && (s as any).kinds.includes(i.kind)).length;
    }
    return c;
  }, [items]);

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
    toast("Deleted", "success");
  }

  const detailHidden = mobileView === "list";
  const listHidden = mobileView === "detail";

  return (
    <div className="max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
            <InboxIcon size={18} className="text-secondary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Inbox</h1>
            <p className="text-xs text-muted-foreground">Submissions from forms and applications</p>
          </div>
          {unreadCount > 0 && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{unreadCount} open</span>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left panel — list */}
        <div className={`w-full lg:w-[340px] shrink-0 space-y-3 ${listHidden ? "hidden lg:block" : ""}`}>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
          </div>

          {/* Stream tabs */}
          <div className="flex flex-wrap gap-1.5">
            {STREAMS.map(s => (
              <button key={s.key} onClick={() => setActiveStream(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeStream === s.key ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-secondary hover:border-primary/40"
                }`}>
                {s.label}
                {streamCounts[s.key] > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold ${
                    activeStream === s.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{streamCounts[s.key]}</span>
                )}
              </button>
            ))}
          </div>

          {/* Processed toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showProcessed} onChange={() => setShowProcessed(p => !p)} className="sr-only peer" />
              <div className="w-8 h-4.5 bg-muted rounded-full peer peer-checked:bg-primary/40 transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-3.5" />
              <span className="text-xs text-muted-foreground">Show resolved</span>
            </label>
          </div>

          {/* List */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16 px-4">
                <InboxIcon size={32} className="text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No submissions</p>
                <p className="text-xs text-muted-foreground/60 mt-1">New form submissions will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filtered.map(item => {
                  const km = kindMeta[item.kind] || kindMeta.contact;
                  const isSelected = item.id === selectedId;
                  return (
                    <button key={item.id} onClick={() => { setSelectedId(item.id); setMobileView("detail"); }}
                      className={`w-full text-left px-4 py-3.5 transition-colors hover:bg-muted/40 ${isSelected ? "bg-muted/60" : ""}`}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${km.color} ${km.bg}`}>
                          {km.label}
                        </span>
                        <span className="text-[11px] text-muted-foreground/70 ml-auto">{timeAgo(item.createdAt)}</span>
                      </div>
                      <p className="text-sm font-medium text-secondary line-clamp-1">{item.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.submitterName || item.submitterEmail || item.summary}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — detail */}
        <div className={`flex-1 min-w-0 ${detailHidden ? "hidden lg:block" : ""}`}>
          {!selected ? (
            <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-24 min-h-[400px]">
              <MessageSquareReply size={36} className="text-muted-foreground/15 mb-3" />
              <p className="text-sm text-muted-foreground">Select a submission to review</p>
            </div>
          ) : (
          <div className="bg-card rounded-xl border border-border">
              {/* Detail header */}
              <div className="px-6 py-5 border-b border-border/60">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setMobileView("list")} className="lg:hidden h-8 px-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-secondary hover:bg-muted transition-colors inline-flex items-center gap-1">
                    <ArrowLeft size={15} /> Back
                  </button>
                  {(() => {
                    const km = kindMeta[selected.kind] || kindMeta.contact;
                    const sm = statusMeta[selected.status] || statusMeta.open;
                    return (
                      <>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${km.color} ${km.bg}`}>{km.label}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${sm.color} ${sm.bg}`}>{sm.label}</span>
                      </>
                    );
                  })()}
                  <div className="ml-auto flex gap-1.5">
                    <button onClick={handleDelete} disabled={deleting}
                      className="h-8 px-3 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all disabled:opacity-50">
                      {confirmDelete ? "Confirm delete" : "Delete"}
                    </button>
                  </div>
                </div>
                <h2 className="font-display text-xl font-bold text-secondary">{selected.title || "Untitled submission"}</h2>
                <p className="text-sm text-muted-foreground mt-1">{selected.summary}</p>

                {/* Submitter info */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  {selected.submitterName && (
                    <div className="flex items-center gap-2 text-secondary"><User size={14} className="text-muted-foreground shrink-0" /> {selected.submitterName}</div>
                  )}
                  {selected.submitterEmail && (
                    <div className="flex items-center gap-2 text-secondary truncate"><Mail size={14} className="text-muted-foreground shrink-0" /> {selected.submitterEmail}</div>
                  )}
                  {selected.details.phone && (
                    <div className="flex items-center gap-2 text-secondary"><Phone size={14} className="text-muted-foreground shrink-0" /> {selected.details.phone}</div>
                  )}
                  <div className="flex items-center gap-2 text-secondary"><CalendarDays size={14} className="text-muted-foreground shrink-0" /> {new Date(selected.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</div>
                </div>

                {/* Action */}
                <div className="mt-5">
                  <a href={`/admin/inbox/${selected.id}`}
                    className="inline-flex items-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 active:scale-[0.98] transition-all">
                    <FileText size={16} />
                    Review Application
                  </a>
                </div>
              </div>

              {/* Details section */}
              {Object.keys(selected.details).length > 0 && (
                <div className="px-6 py-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Submission Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                    {Object.entries(selected.details).map(([key, val]) => {
                      if (val === null || val === "" || val === undefined) return null;
                      const displayVal = Array.isArray(val) ? val.join(", ") : typeof val === "object" ? JSON.stringify(val) : String(val);
                      if (!displayVal) return null;
                      return (
                        <div key={key}>
                          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/60 mb-0.5">{key.replace(/_/g, " ")}</p>
                          <p className="text-sm text-secondary break-words">{displayVal}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
