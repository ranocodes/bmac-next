"use client";

import { useState } from "react";
import {
  BarChart3,
  TicketCheck,
  Wallet,
  Heart,
  BookOpen,
  ClipboardList,
  RefreshCw,
  Users,
  Eye,
  TrendingUp,
  MousePointerClick,
} from "lucide-react";
import {
  DailyViewsAreaChart,
  TopPagesBarChart,
  ConversionFunnelChart,
} from "./AnalyticsCharts";

interface AnalyticsData {
  operational: {
    tickets: {
      byStatus: Record<string, number>;
      confirmed: number;
      pending: number;
      cancelled: number;
      checkedIn: number;
      attendanceRate: number;
    };
    revenue: { events: number; donations: number };
    donations: { total: number; count: number; byStatus: Record<string, number> };
    programs: {
      applications: number;
      participants: number;
      applicationsByStatus: Record<string, number>;
    };
    workflows: Record<string, number>;
  };
  traffic: {
    overview: { totalViews: number; uniqueVisitors: number; todayViews: number; avgDailyViews: number };
    dailyViews: { date: string; views: number; visitors: number }[];
    topPages: { path: string; views: number }[];
    referrers: { host: string; views: number }[];
    devices: { type: string; count: number }[];
  };
  conversions: {
    eventCounts: { name: string; count: number }[];
    funnel: { step: string; count: number; rate: number }[];
  };
}

const EVENT_LABELS: Record<string, string> = {
  event_registered: "Event registrations",
  donation_completed: "Donations",
  program_applied: "Program applications",
  contact_submitted: "Contact forms",
  member_joined: "Members",
  volunteer_submitted: "Volunteers",
  partner_submitted: "Partnerships",
};

export default function AnalyticsClient({ initialData }: { initialData: AnalyticsData }) {
  const [data, setData] = useState(initialData);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) setData(await res.json());
    } catch {}
    setRefreshing(false);
  }

  const ngn = (n: number) => `₦${Math.round(n).toLocaleString("en-NG")}`;

  const ticketStatusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
  };

  const applicationStatusLabels: Record<string, string> = {
    submitted: "Submitted",
    in_review: "In review",
    accepted: "Accepted",
    waitlisted: "Waitlisted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };

  const workflowKindLabels: Record<string, string> = {
    contact: "Contact",
    member: "Member",
    volunteer: "Volunteer",
    partner: "Partnership",
    program: "Program",
    ticket: "Ticket",
    donation: "Donation",
    event_registration: "Event reg",
  };

  const o = data.operational;
  const t = data.traffic;
  const hasTraffic = t.overview.totalViews > 0;

  const statCards = [
    { label: "Confirmed registrations", value: String(o.tickets.confirmed), icon: TicketCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Checked in", value: String(o.tickets.checkedIn), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Attendance rate", value: `${o.tickets.attendanceRate}%`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Donations (verified)", value: ngn(o.donations.total), icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Program applications", value: String(o.programs.applications), icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Program participants", value: String(o.programs.participants), icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Event revenue", value: ngn(o.revenue.events), icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Workflow items", value: String(Object.values(o.workflows).reduce((a, b) => a + b, 0)), icon: ClipboardList, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  const trafficCards = [
    { label: "Total views", value: String(t.overview.totalViews), icon: Eye, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Unique visitors", value: String(t.overview.uniqueVisitors), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Traffic, conversions & operational metrics across events, donations, programs & workflows</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-input bg-card text-sm font-medium text-secondary hover:bg-muted/40 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <MousePointerClick size={18} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-secondary">Traffic</h2>
        </div>
        {!hasTraffic ? (
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <p className="text-sm text-muted-foreground">No traffic yet — visit the public site to start collecting data.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trafficCards.map(c => (
                <div key={c.label} className="bg-card rounded-3xl border border-border/50 p-5">
                  <div className={`inline-flex p-2.5 rounded-2xl ${c.bg} mb-3`}>
                    <c.icon size={20} className={c.color} />
                  </div>
                  <p className="text-2xl font-display font-bold text-secondary">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-card rounded-3xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-bold text-secondary mb-4">Views & visitors (30d)</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#10b981" }} />Views</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#3b82f6" }} />Visitors</span>
                </div>
                <DailyViewsAreaChart data={t.dailyViews} />
              </div>
              <div className="bg-card rounded-3xl border border-border/50 p-6">
                <h3 className="font-display text-lg font-bold text-secondary mb-4">Top pages</h3>
                <TopPagesBarChart data={t.topPages} />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          <h2 className="font-display text-xl font-bold text-secondary">Conversions</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="font-display text-lg font-bold text-secondary mb-4">Funnel</h3>
            <ConversionFunnelChart data={data.conversions.funnel} />
          </div>
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h3 className="font-display text-lg font-bold text-secondary mb-4">Conversion events (30d)</h3>
            <div className="space-y-3">
              {data.conversions.eventCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversion events recorded yet.</p>
              ) : (
                data.conversions.eventCounts.map(e => (
                  <div key={e.name} className="flex items-center justify-between text-sm py-2 border-b border-border/40 last:border-0">
                    <span className="text-secondary">{EVENT_LABELS[e.name] || e.name.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground text-xs">{e.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-secondary">Operational</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(c => (
            <div key={c.label} className="bg-card rounded-3xl border border-border/50 p-5">
              <div className={`inline-flex p-2.5 rounded-2xl ${c.bg} mb-3`}>
                <c.icon size={20} className={c.color} />
              </div>
              <p className="text-2xl font-display font-bold text-secondary">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h2 className="font-display text-lg font-bold text-secondary mb-4">Registrations by status</h2>
            <div className="space-y-3">
              {Object.entries(o.tickets.byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet</p>
              ) : (
                Object.entries(o.tickets.byStatus).map(([status, count]) => (
                  <BarRow key={status} label={ticketStatusLabels[status] || status} value={count} total={o.tickets.confirmed + o.tickets.pending + o.tickets.cancelled || count} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h2 className="font-display text-lg font-bold text-secondary mb-4">Program applications by status</h2>
            <div className="space-y-3">
              {Object.entries(o.programs.applicationsByStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet</p>
              ) : (
                Object.entries(o.programs.applicationsByStatus).map(([status, count]) => (
                  <BarRow key={status} label={applicationStatusLabels[status] || status} value={count} total={o.programs.applications || count} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h2 className="font-display text-lg font-bold text-secondary mb-4">Workflows by type</h2>
            <div className="space-y-3">
              {Object.entries(o.workflows).length === 0 ? (
                <p className="text-sm text-muted-foreground">No workflow records yet</p>
              ) : (
                Object.entries(o.workflows).map(([kind, count]) => (
                  <BarRow key={kind} label={workflowKindLabels[kind] || kind} value={count} total={Object.values(o.workflows).reduce((a, b) => a + b, 0)} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-3xl border border-border/50 p-6">
            <h2 className="font-display text-lg font-bold text-secondary mb-4">Donations</h2>
            <div className="space-y-3">
              {Object.keys(o.donations.byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No donations yet</p>
              ) : (
                Object.entries(o.donations.byStatus).map(([status, count]) => (
                  <BarRow key={status} label={status} value={count} total={o.donations.count || count} />
                ))
              )}
              <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Verified total</span>
                <span className="font-display font-bold text-secondary">{ngn(o.donations.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-secondary">{label}</span>
        <span className="text-muted-foreground text-xs">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
