"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, Calendar, BookOpen, Users,
  ArrowRight, Plus, Activity, ClipboardList,
  TrendingUp, Clock, RefreshCw, LayoutDashboard,
  CheckCircle, XCircle, DollarSign,
} from "lucide-react";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";
import { updateApplicationStatus } from "@/actions/programs";

interface PendingApplication {
  id: string;
  program_title: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
}

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  entity_title: string;
  admin_name: string;
  created_at: string;
}

interface DashboardCounts {
  totalMembers: number;
  activePrograms: number;
  pendingApps: number;
  revenueThisMonth: number;
  openInquiries: number;
  eventsThisMonth: number;
}

interface ChartPoint {
  month: string;
  value: number;
}

interface DashboardProps {
  initialCounts: DashboardCounts;
  recentNews: any[];
  recentEvents: any[];
  recentActivity: ActivityItem[];
  todayCount: number;
  revenueByMonth: ChartPoint[];
  memberGrowth: ChartPoint[];
}

const quickActions = [
  { label: "New Article", href: "/admin/news/new", icon: Newspaper, color: "text-blue-500" },
  { label: "New Event", href: "/admin/events/new", icon: Calendar, color: "text-amber-500" },
  { label: "New Program", href: "/admin/programs/new", icon: BookOpen, color: "text-emerald-500" },
  { label: "New Member", href: "/admin/people/new", icon: Users, color: "text-purple-500" },
];

function MiniBarChart({ data, color }: { data: ChartPoint[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map(d => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-sm ${color} transition-all`}
            style={{ height: `${Math.max((d.value / max) * 100, 4)}%` }}
            title={`${d.month}: ${d.value.toLocaleString("en-NG")}`}
          />
        </div>
      ))}
    </div>
  );
}

function MonthLabels({ data }: { data: ChartPoint[] }) {
  return (
    <div className="flex gap-1">
      {data.map(d => (
        <div key={d.month} className="flex-1 text-center text-[9px] text-muted-foreground/60">
          {d.month.slice(5)}
        </div>
      ))}
    </div>
  );
}

export default function DashboardClient({ initialCounts, recentNews, recentEvents, recentActivity, todayCount, revenueByMonth, memberGrowth }: DashboardProps) {
  const user = useAdmin();
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Good day");
  const [counts, setCounts] = useState(initialCounts);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingApps, setPendingApps] = useState<PendingApplication[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    async function fetchPending() {
      try {
        const res = await fetch("/api/admin/pending-applications");
        if (res.ok) {
          const data = await res.json();
          setPendingApps(data.applications || []);
        }
      } catch {}
    }
    fetchPending();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setCounts(prev => ({ ...prev, ...data.counts }));
      }
    } catch {}
    setRefreshing(false);
  }

  const canViewActivity = user?.permissions.includes("manage_users") ?? false;

  async function handleQuickAccept(app: PendingApplication) {
    setProcessingId(app.id);
    const result = await updateApplicationStatus({ applicationId: app.id, status: "accepted", adminEmail: user?.email || "" });
    if (result.error) toast(result.error, "error");
    else { setPendingApps(prev => prev.filter(a => a.id !== app.id)); toast(`Accepted ${app.applicant_name || "applicant"}`, "success"); }
    setProcessingId(null);
  }

  async function handleQuickReject(app: PendingApplication) {
    setProcessingId(app.id);
    const result = await updateApplicationStatus({ applicationId: app.id, status: "rejected", adminEmail: user?.email || "" });
    if (result.error) toast(result.error, "error");
    else { setPendingApps(prev => prev.filter(a => a.id !== app.id)); toast(`Rejected ${app.applicant_name || "applicant"}`, "success"); }
    setProcessingId(null);
  }

  const statCards = [
    { label: "Members", value: counts.totalMembers, icon: Users, color: "text-blue-500", bg: "bg-blue-50", href: "/admin/people?role=member" },
    { label: "Active Programs", value: counts.activePrograms, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50", href: "/admin/programs" },
    { label: "Pending Apps", value: counts.pendingApps, icon: ClipboardList, color: "text-amber-500", bg: "bg-amber-50", href: "/admin/inbox" },
    { label: "Revenue (MTD)", value: counts.revenueThisMonth, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", format: "currency" as const },
    { label: "Open Inquiries", value: counts.openInquiries, icon: Clock, color: "text-orange-500", bg: "bg-orange-50", href: "/admin/workflow" },
    { label: "Events This Month", value: counts.eventsThisMonth, icon: Calendar, color: "text-purple-500", bg: "bg-purple-50", href: "/admin/events" },
  ];

  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
  const fmtCurrency = (v: number) => `\u20A6${(v / 100).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <LayoutDashboard size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">
              {greeting}, {user?.firstName ?? "Admin"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Here is what is happening across your site.</p>
          </div>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 bg-card border border-border text-muted-foreground hover:text-secondary rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards — 2-column grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map(card => {
          const body = (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <card.icon size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-widest">{card.label}</span>
              </div>
              <p className="mt-3 font-display text-[28px] leading-none font-bold tracking-tight text-secondary">
                {card.format === "currency" ? fmtCurrency(card.value) : fmt(card.value)}
              </p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block hover:ring-2 hover:ring-primary/20 rounded-xl transition-all">{body}</Link>
          ) : (
            <div key={card.label}>{body}</div>
          );
        })}
      </div>

      {/* Charts row */}
      {(revenueByMonth.length > 0 || memberGrowth.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {revenueByMonth.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-emerald-500" />
                <h3 className="text-xs font-semibold text-secondary">Revenue Trend</h3>
              </div>
              <MiniBarChart data={revenueByMonth} color="bg-emerald-500" />
              <MonthLabels data={revenueByMonth} />
            </div>
          )}
          {memberGrowth.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-blue-500" />
                <h3 className="text-xs font-semibold text-secondary">Member Growth</h3>
              </div>
              <MiniBarChart data={memberGrowth} color="bg-blue-500" />
              <MonthLabels data={memberGrowth} />
            </div>
          )}
        </div>
      )}

      {/* Pending Applications Quick Review */}
      {pendingApps.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-secondary">Pending Applications</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{pendingApps.length}</span>
            </div>
            <Link href="/admin/inbox" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          <div className="space-y-2">
            {pendingApps.slice(0, 5).map((app) => (
              <div key={app.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={15} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-secondary truncate">{app.applicant_name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground truncate">{app.program_title} &middot; {app.applicant_email}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => handleQuickAccept(app)} disabled={processingId === app.id}
                    className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all disabled:opacity-50">
                    <CheckCircle size={14} />
                  </button>
                  <button onClick={() => handleQuickReject(app)} disabled={processingId === app.id}
                    className="h-8 px-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-all disabled:opacity-50">
                    <XCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-5 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-3 h-12 px-4 rounded-lg bg-muted/50 hover:bg-muted border border-border/30 transition-all active:scale-[0.97]">
              <a.icon size={18} className={a.color} />
              <span className="text-sm font-medium text-secondary">{a.label}</span>
              <ArrowRight size={14} className="ml-auto text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-card rounded-xl border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-secondary">Recent News</h2>
            </div>
            <Link href="/admin/news" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Newspaper size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No articles yet</p>
              <Link href="/admin/news/new" className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first article</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNews.map((a: any) => (
                <Link key={a.id} href={`/admin/news/${a.id}/edit`} className="flex items-center gap-4 py-3 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Newspaper size={15} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.date} &middot; {a.category}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/news/new" className="mt-5 flex items-center justify-center gap-2 h-11 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={15} /> Add article
          </Link>
        </div>

        <div className="xl:col-span-2 bg-card rounded-xl border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-secondary">Upcoming Events</h2>
            </div>
            <Link href="/admin/events" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No events yet</p>
              <Link href="/admin/events/new" className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first event</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentEvents.map((e: any) => (
                <Link key={e.id} href={`/admin/events/${e.id}/edit`} className="flex items-center gap-4 py-3 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors">
                    <Calendar size={15} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{e.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.date} &middot; {e.venue}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/events/new" className="mt-5 flex items-center justify-center gap-2 h-11 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={15} /> Add event
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      {canViewActivity && (
        <div className="bg-card rounded-xl border border-border p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-secondary">Recent Activity</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{todayCount} today</span>
            </div>
            <Link href="/admin/logs" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <ClipboardList size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No activity logged yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((log: any) => (
                <div key={log.id} className="flex items-start gap-3 py-2.5 border-b border-border/10 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 bg-primary/20 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium text-secondary">{log.user}</span>
                      <span className="text-[9px] font-bold px-1 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">{log.action}</span>
                      <span className="text-[11px] text-muted-foreground">{log.resource}</span>
                    </div>
                    {log.details && <p className="text-[11px] text-muted-foreground/60 mt-0.5 truncate max-w-lg">{log.details}</p>}
                  </div>
                  <span className="text-[10px] text-muted-foreground/40 whitespace-nowrap shrink-0">
                    {new Date(log.timestamp || log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}