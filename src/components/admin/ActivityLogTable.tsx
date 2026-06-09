"use client";

import { useEffect, useState } from "react";
import { ClipboardList, Search, Trash2, Filter } from "lucide-react";
import { getAll, setItem } from "@/data/store";
import { useToast } from "@/components/ui/Toast";
import { requirePermission, getSessionUser } from "@/lib/permissions";

export default function ActivityLogTable() {
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const { toast, confirm } = useToast();

  function load() {
    const all = getAll<any>("activity_logs");
    setLogs(all);
  }

  useEffect(() => { load(); }, []);

  function formatTime(ts: number) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  async function handleClear() {
    const session = getSessionUser();
    if (!session || !requirePermission(session.email, "manage_users")) {
      toast("You don't have permission to clear logs", "error");
      return;
    }
    const ok = await confirm("Clear all activity logs? This cannot be undone.");
    if (!ok) return;
    setItem("activity_logs", []);
    setLogs([]);
    toast("Logs cleared", "success");
  }

  const actions = [...new Set(logs.map(l => l.action))].sort();

  const filtered = logs.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.user?.toLowerCase().includes(q) && !l.resource?.toLowerCase().includes(q) && !l.details?.toLowerCase().includes(q)) return false;
    }
    if (actionFilter && l.action !== actionFilter) return false;
    return true;
  });

  return (
    <div className="w-full max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit trail of all administrative actions</p>
        </div>
        <button onClick={handleClear}
          className="flex items-center gap-2 h-10 px-4 rounded-xl bg-background border border-input text-muted-foreground text-sm font-medium hover:text-destructive hover:border-destructive/30 transition-all">
          <Trash2 size={14} /> Clear Logs
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users, resources, details..."
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-input text-sm text-secondary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="h-10 pl-9 pr-8 rounded-xl bg-background border border-input text-sm text-secondary appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/50 transition-colors">
            <option value="">All actions</option>
            {actions.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-card/30 border border-border/30 rounded-xl">
          <ClipboardList size={48} className="text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{logs.length === 0 ? "No activity logged yet" : "No logs match your filters"}</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3 bg-card/30 border border-border/20 rounded-lg hover:bg-card/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary/30 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-secondary">{log.user}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wider">{log.action}</span>
                  <span className="text-xs text-muted-foreground">{log.resource}{log.resourceId ? ` #${log.resourceId.slice(0, 12)}` : ""}</span>
                </div>
                {log.details && <p className="text-xs text-muted-foreground/70 mt-0.5">{log.details}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap shrink-0 mt-0.5">{formatTime(log.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
