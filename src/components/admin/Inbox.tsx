"use client";

import { useMemo, useState } from "react";
import { Inbox as InboxIcon, Search, Send, MessageSquareReply, Clock, Mail, User, Phone, CalendarDays, Trash2, ArrowLeft, FileText, Banknote, MessageCircle, Calendar, ChevronDown } from "lucide-react";
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
  { key: "all", label: "All Applications", icon: InboxIcon },
  { key: "applications", label: "All Applications", icon: FileText, kinds: ["program", "volunteer", "member"] },
  { key: "program", label: "Cohort", icon: FileText, kinds: ["program"] },
  { key: "volunteer", label: "Volunteer", icon: FileText, kinds: ["volunteer"] },
  { key: "member", label: "Membership", icon: FileText, kinds: ["member"] },
] as const;

const EMPTY_MESSAGES: Record<string, { message: string; sub?: string }> = {
  all: { message: "No applications yet" },
  applications: { message: "No pending applications", sub: "Applications from programs, volunteering, and membership will appear here." },
  program: { message: "No cohort applications", sub: "Program and cohort applications will appear here." },
  volunteer: { message: "No volunteer applications", sub: "Volunteer applications will appear here." },
  member: { message: "No membership applications", sub: "Membership applications will appear here." },
};

type SortOption = "newest" | "priority";

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: "newest", label: "Newest first" },
];

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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showProcessed, setShowProcessed] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { toast } = useToast();

  const selected = useMemo(() => items.find(i => i.id === selectedId) || null, [items, selectedId]);

  const filtered = useMemo(() => {
    const streamDef = STREAMS.find(s => s.key === activeStream);
    let result = items.filter(i => {
      if (!showProcessed && (i.status === "resolved" || i.status === "closed")) return false;
      if (streamDef && "kinds" in streamDef && !(streamDef as any).kinds.includes(i.kind)) return false;
      if (filterKind !== "all" && i.kind !== filterKind) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (i.title + " " + i.summary + " " + i.submitterName + " " + i.submitterEmail).toLowerCase().includes(q);
    });
    result = [...result].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return result;
  }, [items, search, filterKind, activeStream, sortBy]);

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
            {STREAMS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.key} onClick={() => { setActiveStream(s.key); setFilterKind("all"); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeStream === s.key ? "bg-primary/10 text-primary border-primary/20" : "bg-card border-border text-secondary hover:border-primary/40"
                  }`}>
                  <Icon size={13} />
                  {s.label}
                  {streamOpenCounts[s.key] > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {streamOpenCounts[s.key]}
                    </span>
                  )}
                </button>
              );
            })}
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
            <button onClick={() => setShowProcessed(p => !p)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                showProcessed ? "bg-amber-50 text-amber-700 border-amber-200" : "border-border text-muted-foreground hover:text-secondary hover:border-primary/40"
              }`}>
              {showProcessed ? "Hide processed" : "Show processed"}
            </button>
          </div>
          <div className="relative">
            <button onClick={() => setSortOpen(p => !p)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-secondary hover:border-primary/40 transition-all">
              <Clock size={12} />
              {SORT_OPTIONS.find(o => o.key === sortBy)?.label}
              <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-xl shadow-lg py-1.5">
                {SORT_OPTIONS.map(o => (
                  <button key={o.key} onClick={() => { setSortBy(o.key); setSortOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                      sortBy === o.key ? "text-primary bg-primary/5" : "text-secondary hover:bg-muted"
                    }`}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="text-center py-16">
                {(() => {
                  const streamDef = STREAMS.find(s => s.key === activeStream);
                  const StreamIcon = streamDef?.icon ?? InboxIcon;
                  const emptyInfo = EMPTY_MESSAGES[activeStream] || EMPTY_MESSAGES.all;
                  if (search || filterKind !== "all") {
                    return (
                      <>
                        <InboxIcon size={36} className="text-muted-foreground/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No submissions match</p>
                      </>
                    );
                  }
                  return (
                    <>
                      <StreamIcon size={36} className="text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground font-medium">{emptyInfo.message}</p>
                      {emptyInfo.sub && <p className="text-xs text-muted-foreground/60 mt-1 max-w-[240px] mx-auto">{emptyInfo.sub}</p>}
                    </>
                  );
                })()}
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

                <div className="mt-6">
                  <a href={`/admin/inbox/${selected.id}`}
                    className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-secondary text-secondary-foreground text-sm font-bold hover:bg-primary transition-all">
                    Review Application →
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
