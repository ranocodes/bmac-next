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
} from "lucide-react";

interface AnalyticsData {
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
}

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

  const statCards = [
    { label: "Confirmed registrations", value: String(data.tickets.confirmed), icon: TicketCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Checked in", value: String(data.tickets.checkedIn), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Attendance rate", value: `${data.tickets.attendanceRate}%`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Donations (verified)", value: ngn(data.donations.total), icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Program applications", value: String(data.programs.applications), icon: BookOpen, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Program participants", value: String(data.programs.participants), icon: Users, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Event revenue", value: ngn(data.revenue.events), icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Workflow items", value: String(Object.values(data.workflows).reduce((a, b) => a + b, 0)), icon: ClipboardList, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 size={24} className="text-primary shrink-0" />
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">Operational metrics across events, donations, programs & workflows</p>
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
            {Object.entries(data.tickets.byStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No registrations yet</p>
            ) : (
              Object.entries(data.tickets.byStatus).map(([status, count]) => (
                <BarRow key={status} label={ticketStatusLabels[status] || status} value={count} total={data.tickets.confirmed + data.tickets.pending + data.tickets.cancelled || count} />
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-6">
          <h2 className="font-display text-lg font-bold text-secondary mb-4">Program applications by status</h2>
          <div className="space-y-3">
            {Object.entries(data.programs.applicationsByStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet</p>
            ) : (
              Object.entries(data.programs.applicationsByStatus).map(([status, count]) => (
                <BarRow key={status} label={applicationStatusLabels[status] || status} value={count} total={data.programs.applications || count} />
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-6">
          <h2 className="font-display text-lg font-bold text-secondary mb-4">Workflows by type</h2>
          <div className="space-y-3">
            {Object.entries(data.workflows).length === 0 ? (
              <p className="text-sm text-muted-foreground">No workflow records yet</p>
            ) : (
              Object.entries(data.workflows).map(([kind, count]) => (
                <BarRow key={kind} label={workflowKindLabels[kind] || kind} value={count} total={Object.values(data.workflows).reduce((a, b) => a + b, 0)} />
              ))
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/50 p-6">
          <h2 className="font-display text-lg font-bold text-secondary mb-4">Donations</h2>
          <div className="space-y-3">
            {Object.keys(data.donations.byStatus).length === 0 ? (
              <p className="text-sm text-muted-foreground">No donations yet</p>
            ) : (
              Object.entries(data.donations.byStatus).map(([status, count]) => (
                <BarRow key={status} label={status} value={count} total={data.donations.count || count} />
              ))
            )}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified total</span>
              <span className="font-display font-bold text-secondary">{ngn(data.donations.total)}</span>
            </div>
          </div>
        </div>
      </div>
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
