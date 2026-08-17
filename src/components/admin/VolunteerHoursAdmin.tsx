"use client";

import { useState } from "react";
import { Check, X, Clock, Users, Filter } from "lucide-react";
import { approveVolunteerHours } from "@/actions/volunteer-hours";

interface HoursRow {
  id: string;
  person_id: string;
  hours: number;
  description: string;
  date: string;
  status: string;
  approved_by: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  approved: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function VolunteerHoursAdmin({
  initialData,
}: {
  initialData: HoursRow[];
}) {
  const [data, setData] = useState(initialData);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [loading, setLoading] = useState<string | null>(null);

  const filtered = filter === "all" ? data : data.filter((r) => r.status === filter);

  const totalsByPerson = data.reduce<Record<string, { name: string; approved: number; pending: number }>>((acc, r) => {
    const key = r.person_id;
    if (!acc[key]) acc[key] = { name: `${r.first_name} ${r.last_name}`, approved: 0, pending: 0 };
    if (r.status === "approved") acc[key].approved += r.hours;
    if (r.status === "pending") acc[key].pending += r.hours;
    return acc;
  }, {});

  async function handleAction(hoursId: string, action: "approve" | "reject") {
    setLoading(hoursId);
    const result = await approveVolunteerHours({ hoursId, approvedBy: "admin", action });
    if (result.success) {
      setData((prev) =>
        prev.map((r) =>
          r.id === hoursId ? { ...r, status: action === "approve" ? "approved" : "rejected" } : r
        )
      );
    }
    setLoading(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-secondary">Volunteer Hours</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} total entries · {data.filter((r) => r.status === "pending").length} pending
          </p>
        </div>
      </div>

      {/* Summary by volunteer */}
      {Object.keys(totalsByPerson).length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Hours by Volunteer
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(totalsByPerson)
              .sort((a, b) => b[1].approved - a[1].approved)
              .map(([id, v]) => (
                <div key={id} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                  <span className="text-sm font-medium text-secondary truncate">{v.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-green-600 font-semibold">{v.approved}h</span>
                    {v.pending > 0 && <span className="text-amber-600">{v.pending}h pending</span>}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {(["all", "pending", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm font-semibold text-secondary">No entries</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "all" ? "No volunteer hours logged yet." : `No ${filter} entries.`}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Volunteer
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Hours
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-secondary">{row.first_name} {row.last_name}</p>
                    <p className="text-[10px] text-muted-foreground">{row.email}</p>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs">{formatDate(row.date)}</td>
                  <td className="px-4 py-2.5 font-semibold text-secondary">{row.hours}h</td>
                  <td className="px-4 py-2.5 text-muted-foreground text-xs max-w-[200px] truncate">
                    {row.description}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[row.status] ?? ""}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {row.status === "pending" && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          disabled={loading === row.id}
                          onClick={() => handleAction(row.id, "approve")}
                          className="p-1.5 rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          disabled={loading === row.id}
                          onClick={() => handleAction(row.id, "reject")}
                          className="p-1.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          title="Reject"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
