"use client";

import { useState } from "react";
import {
  BarChart3,
  TicketCheck,
  Wallet,
  Heart,
  BookOpen,
  RefreshCw,
  Users,
  Eye,
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


  const o = data.operational;
  const t = data.traffic;
  const hasTraffic = t.overview.totalViews > 0;

  const statCards = [
    { label: "Confirmed registrations", value: String(o.tickets.confirmed), icon: TicketCheck },
    { label: "Checked in", value: String(o.tickets.checkedIn), icon: Users },
    { label: "Attendance rate", value: `${o.tickets.attendanceRate}%`, icon: BarChart3 },
    { label: "Donations (verified)", value: ngn(o.donations.total), icon: Heart },
    { label: "Program applications", value: String(o.programs.applications), icon: BookOpen },
    { label: "Program participants", value: String(o.programs.participants), icon: Users },
    { label: "Event revenue", value: ngn(o.revenue.events), icon: Wallet },
  ];

  const trafficCards = [
    { label: "Total views", value: String(t.overview.totalViews), icon: Eye },
    { label: "Unique visitors", value: String(t.overview.uniqueVisitors), icon: Users },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <BarChart3 size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Analytics</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Traffic, conversions & operational metrics</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-card text-sm font-medium text-secondary hover:bg-muted/50 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <section className="space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Traffic</h2>
        {!hasTraffic ? (
          <div className="bg-card rounded-xl border border-border p-6 text-sm text-muted-foreground">
            No traffic yet — visit the public site to start collecting data.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {trafficCards.map(c => (
                <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-secondary mb-4">Views &amp; visitors (30d)</h3>
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />Views</span>
                  <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#3b82f6" }} />Visitors</span>
                </div>
                <DailyViewsAreaChart data={t.dailyViews} />
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-sm font-semibold text-secondary mb-4">Top pages</h3>
                <TopPagesBarChart data={t.topPages} />
              </div>
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Conversions</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-secondary mb-4">Funnel</h3>
            <ConversionFunnelChart data={data.conversions.funnel} />
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="text-sm font-semibold text-secondary mb-4">Conversion events (30d)</h3>
            <div className="space-y-1">
              {data.conversions.eventCounts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conversion events recorded yet.</p>
              ) : (
                data.conversions.eventCounts.map(e => (
                  <div key={e.name} className="flex items-center justify-between text-sm py-2.5 border-b border-border/40 last:border-0">
                    <span className="text-secondary">{EVENT_LABELS[e.name] || e.name.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground text-xs tabular-nums">{e.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Operational</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(c => (
            <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-secondary mb-4">Registrations by status</h2>
            <div className="space-y-3.5">
              {Object.entries(o.tickets.byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No registrations yet</p>
              ) : (
                Object.entries(o.tickets.byStatus).map(([status, count]) => (
                  <BarRow key={status} label={ticketStatusLabels[status] || status} value={count} total={o.tickets.confirmed + o.tickets.pending + o.tickets.cancelled || count} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-secondary mb-4">Program applications by status</h2>
            <div className="space-y-3.5">
              {Object.entries(o.programs.applicationsByStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No applications yet</p>
              ) : (
                Object.entries(o.programs.applicationsByStatus).map(([status, count]) => (
                  <BarRow key={status} label={applicationStatusLabels[status] || status} value={count} total={o.programs.applications || count} />
                ))
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h2 className="text-sm font-semibold text-secondary mb-4">Donations</h2>
            <div className="space-y-3.5">
              {Object.keys(o.donations.byStatus).length === 0 ? (
                <p className="text-sm text-muted-foreground">No donations yet</p>
              ) : (
                Object.entries(o.donations.byStatus).map(([status, count]) => (
                  <BarRow key={status} label={status} value={count} total={o.donations.count || count} />
                ))
              )}
              <div className="pt-3.5 border-t border-border flex items-center justify-between">
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

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
      </div>
      <p className="mt-3 font-display text-[28px] leading-none font-bold tracking-tight text-secondary">{value}</p>
    </div>
  );
}

function BarRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="text-secondary">{label}</span>
        <span className="text-muted-foreground text-xs tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-secondary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
