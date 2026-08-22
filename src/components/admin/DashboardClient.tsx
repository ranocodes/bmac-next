"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Newspaper, Calendar, BookOpen, Users,
  ArrowRight, Plus, TrendingUp, RefreshCw,
  LayoutDashboard, DollarSign,
} from "lucide-react";
import { useAdmin } from "@/lib/auth/admin-context";

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
  revenueByMonth: ChartPoint[];
  memberGrowth: ChartPoint[];
}

const quickActions = [
  { label: "Article", href: "/admin/news/new", icon: Newspaper, color: "text-blue-500" },
  { label: "Event", href: "/admin/events/new", icon: Calendar, color: "text-amber-500" },
  { label: "Program", href: "/admin/programs/new", icon: BookOpen, color: "text-emerald-500" },
  { label: "Member", href: "/admin/people/new", icon: Users, color: "text-purple-500" },
];

function MiniBarChart({ data, color }: { data: ChartPoint[]; color: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-14">
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

export default function DashboardClient({ initialCounts, recentNews, recentEvents, revenueByMonth, memberGrowth }: DashboardProps) {
  const user = useAdmin();
  const [greeting, setGreeting] = useState("Good day");
  const [counts, setCounts] = useState(initialCounts);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
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

  const statCards = [
    { label: "Members", value: counts.totalMembers, icon: Users, color: "text-blue-500", href: "/admin/people?role=member" },
    { label: "Programs", value: counts.activePrograms, icon: BookOpen, color: "text-emerald-500", href: "/admin/programs" },
    { label: "Revenue", value: counts.revenueThisMonth, icon: DollarSign, color: "text-emerald-600", format: "currency" as const },
    { label: "Events", value: counts.eventsThisMonth, icon: Calendar, color: "text-purple-500", href: "/admin/events" },
  ];

  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v);
  const fmtCurrency = (v: number) => `\u20A6${(v / 100).toLocaleString("en-NG")}`;

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-secondary">
            {greeting}, {user?.firstName ?? "Admin"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Here is what is happening across your site.</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="flex items-center gap-1.5 h-8 px-3 bg-card border border-border text-muted-foreground hover:text-secondary rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Stat cards — 2-col mobile, 3-col desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {statCards.map(card => {
          const body = (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <card.icon size={13} />
                <span className="text-[10px] font-semibold uppercase tracking-widest">{card.label}</span>
              </div>
              <p className="mt-2 font-display text-2xl leading-none font-bold tracking-tight text-secondary">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {revenueByMonth.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={13} className="text-emerald-500" />
                <h3 className="text-xs font-semibold text-secondary">Revenue Trend</h3>
              </div>
              <MiniBarChart data={revenueByMonth} color="bg-emerald-500" />
              <MonthLabels data={revenueByMonth} />
            </div>
          )}
          {memberGrowth.length > 0 && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={13} className="text-blue-500" />
                <h3 className="text-xs font-semibold text-secondary">Member Growth</h3>
              </div>
              <MiniBarChart data={memberGrowth} color="bg-blue-500" />
              <MonthLabels data={memberGrowth} />
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {quickActions.map(a => (
            <Link key={a.href} href={a.href}
              className="flex items-center gap-2.5 h-10 px-3 rounded-lg bg-muted/50 hover:bg-muted border border-border/30 transition-all active:scale-[0.97]">
              <a.icon size={16} className={a.color} />
              <span className="text-sm font-medium text-secondary">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3 bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Newspaper size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-secondary">Recent News</h2>
            </div>
            <Link href="/admin/news" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Newspaper size={28} className="text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No articles yet</p>
              <Link href="/admin/news/new" className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first article</Link>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentNews.map((a: any) => (
                <Link key={a.id} href={`/admin/news/${a.id}/edit`} className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Newspaper size={14} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{a.date} · {a.category}</p>
                  </div>
                  <ArrowRight size={13} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/news/new" className="mt-4 flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={14} /> Add article
          </Link>
        </div>

        <div className="xl:col-span-2 bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-secondary">Upcoming Events</h2>
            </div>
            <Link href="/admin/events" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar size={28} className="text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No events yet</p>
              <Link href="/admin/events/new" className="mt-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first event</Link>
            </div>
          ) : (
            <div className="space-y-0.5">
              {recentEvents.map((e: any) => (
                <Link key={e.id} href={`/admin/events/${e.id}/edit`} className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors">
                    <Calendar size={14} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{e.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{e.date} · {e.venue}</p>
                  </div>
                  <ArrowRight size={13} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/events/new" className="mt-4 flex items-center justify-center gap-2 h-10 rounded-lg border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={14} /> Add event
          </Link>
        </div>
      </div>
    </div>
  );
}
