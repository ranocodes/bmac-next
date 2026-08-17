"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, Calendar, BookOpen, Image, Users, Star,
  ArrowRight, Plus, Sparkle, Activity, ClipboardList,
  TrendingUp, UserCheck, RefreshCw, Globe, LayoutDashboard,
  CheckCircle, XCircle, Clock,
} from "lucide-react";
import { useAdmin } from "@/lib/auth/admin-context";
import { useToast } from "@/components/ui/Toast";
import { updateApplicationStatus } from "@/actions/programs";
import type { NewsArticle, EventPass } from "@/types/cms";

interface PendingApplication {
  id: string;
  program_title: string;
  applicant_name: string;
  applicant_email: string;
  status: string;
  created_at: string;
}

interface DashboardProps {
  initialCounts: Record<string, number>;
  recentNews: any[];
  recentEvents: any[];
  recentActivity: any[];
  todayCount: number;
}

interface ActivitySummary {
  topUsers: { name: string; count: number }[];
  topActions: { action: string; count: number }[];
}

interface VisitorStats {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  topPages: { path: string; count: number }[];
}

const quickActions = [
  { label: "New Article", href: "/admin/news/new", icon: Newspaper, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "New Event", href: "/admin/events/new", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "New Program", href: "/admin/programs/new", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Upload Photo", href: "/admin/gallery/new", icon: Image, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function DashboardClient({ initialCounts, recentNews, recentEvents, recentActivity, todayCount }: DashboardProps) {
  const user = useAdmin();
  const { toast } = useToast();
  const [greeting, setGreeting] = useState("Good day");
  const [liveCounts, setLiveCounts] = useState(initialCounts);
  const [activitySummary, setActivitySummary] = useState<ActivitySummary | null>(null);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingApps, setPendingApps] = useState<PendingApplication[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  useEffect(() => {
    async function fetchLive() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) return;
        const data = await res.json();
        setLiveCounts(prev => ({ ...prev, ...data.counts }));
        if (data.activity) setActivitySummary(data.activity);
        if (data.visitors) setVisitorStats(data.visitors);
      } catch {}
    }
    fetchLive();
    const id = setInterval(fetchLive, 30000);
    return () => clearInterval(id);
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
        setLiveCounts(prev => ({ ...prev, ...data.counts }));
        if (data.activity) setActivitySummary(data.activity);
        if (data.visitors) setVisitorStats(data.visitors);
      }
    } catch {}
    setRefreshing(false);
  }

  const canViewActivity = user?.permissions.includes("manage_users") ?? false;

  async function handleQuickAccept(app: PendingApplication) {
    setProcessingId(app.id);
    const result = await updateApplicationStatus({
      applicationId: app.id,
      status: "accepted",
      adminEmail: user?.email || "",
    });
    if (result.error) {
      toast(result.error, "error");
    } else {
      setPendingApps(prev => prev.filter(a => a.id !== app.id));
      toast(`Accepted ${app.applicant_name || "applicant"}`, "success");
    }
    setProcessingId(null);
  }

  async function handleQuickReject(app: PendingApplication) {
    setProcessingId(app.id);
    const result = await updateApplicationStatus({
      applicationId: app.id,
      status: "rejected",
      adminEmail: user?.email || "",
    });
    if (result.error) {
      toast(result.error, "error");
    } else {
      setPendingApps(prev => prev.filter(a => a.id !== app.id));
      toast(`Rejected ${app.applicant_name || "applicant"}`, "success");
    }
    setProcessingId(null);
  }

  const statCards: {
    label: string;
    value: number;
    icon: typeof Newspaper;
    color: string;
    bg: string;
    href?: string;
  }[] = [
    { label: "News", value: liveCounts.news, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Events", value: liveCounts.events, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Programs", value: liveCounts.programs, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Gallery", value: liveCounts.gallery, icon: Image, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Team", value: liveCounts.team, icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Testimonials", value: liveCounts.testimonials, icon: Star, color: "text-cyan-500", bg: "bg-cyan-50" },
    { label: "Open Workflows", value: liveCounts.workflowOpen ?? 0, icon: ClipboardList, color: "text-indigo-500", bg: "bg-indigo-50", href: "/admin/workflow" },
  ];

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
          className="flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 bg-card border border-border text-muted-foreground hover:text-secondary rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0 sm:mt-0">
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-7 gap-4">
        {statCards.map(card => {
          const body = (
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <card.icon size={14} />
                <span className="text-[11px] font-semibold uppercase tracking-widest">{card.label}</span>
              </div>
              <p className="mt-3 font-display text-[28px] leading-none font-bold tracking-tight text-secondary">{card.value}</p>
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href} className="block">{body}</Link>
          ) : (
            <div key={card.label}>{body}</div>
          );
        })}
      </div>

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
                  <button
                    onClick={() => handleQuickAccept(app)}
                    disabled={processingId === app.id}
                    className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-all disabled:opacity-50"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleQuickReject(app)}
                    disabled={processingId === app.id}
                    className="h-8 px-3 rounded-lg bg-red-50 text-red-700 text-xs font-semibold hover:bg-red-100 transition-all disabled:opacity-50"
                  >
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
        <div className="flex items-center gap-2 mb-5">
          <Sparkle size={16} className="text-muted-foreground" />
          <h2 className="text-sm font-semibold text-secondary">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3.5 h-auto lg:h-12 pt-4 pb-3.5 lg:py-0 px-4 md:px-5 lg:px-5 rounded-lg bg-muted/50 hover:bg-muted border border-border/30 transition-all active:scale-[0.97] text-center lg:text-left"
            >
              <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center flex-shrink-0">
                <a.icon size={18} />
              </div>
              <span className="text-sm md:text-base lg:text-sm font-medium text-secondary">{a.label}</span>
              <ArrowRight size={15} className="hidden lg:block ml-auto text-muted-foreground flex-shrink-0" />
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
      {canViewActivity && <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3 bg-card rounded-xl border border-border p-5 md:p-6">
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

        {/* Activity Summary */}
        <div className="xl:col-span-2 space-y-6">
          {/* Top Pages */}
          {visitorStats?.topPages && visitorStats.topPages.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-secondary">Top Pages</h2>
              </div>
              <div className="space-y-2">
                {visitorStats.topPages.map((p, i) => (
                  <div key={p.path} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30">
                    <span className="w-5 text-xs font-bold text-muted-foreground/50">#{i + 1}</span>
                    <span className="flex-1 text-xs font-medium text-secondary truncate">{p.path}</span>
                    <span className="text-xs font-semibold text-primary">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activitySummary?.topUsers && activitySummary.topUsers.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserCheck size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-secondary">Most Active Users</h2>
              </div>
              <div className="space-y-2">
                {activitySummary.topUsers.map((u, i) => (
                  <div key={u.name} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30">
                    <span className="w-5 text-xs font-bold text-muted-foreground/50">#{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-secondary truncate">{u.name}</span>
                    <span className="text-xs font-semibold text-primary">{u.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activitySummary?.topActions && activitySummary.topActions.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-5 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} className="text-muted-foreground" />
                <h2 className="text-sm font-semibold text-secondary">Top Actions</h2>
              </div>
              <div className="space-y-2">
                {activitySummary.topActions.map((a, i) => (
                  <div key={a.action} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30">
                    <span className="w-5 text-xs font-bold text-muted-foreground/50">#{i + 1}</span>
                    <span className="flex-1 text-xs font-medium text-secondary capitalize truncate">{a.action.replace(/_/g, " ")}</span>
                    <span className="text-xs font-semibold text-primary">{a.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>}
    </div>
  );
}
