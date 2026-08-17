"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle, Hourglass } from "lucide-react";
import {
  logVolunteerHours,
  getVolunteerHours,
  getVolunteerSummary,
} from "@/actions/volunteer-hours";

interface HoursRecord {
  id: string;
  hours: number;
  description: string;
  date: string;
  status: string;
  created_at: string;
}

interface Summary {
  total_hours: number;
  pending_hours: number;
  approved_hours: number;
  by_activity: { description: string; hours: number; count: number }[];
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function formatDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function VolunteerHoursWidget({
  personId,
  email,
}: {
  personId: string;
  email: string;
}) {
  const [hours, setHours] = useState<HoursRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ hours: "", description: "", date: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!personId) {
      setLoading(false);
      return;
    }
    Promise.all([
      getVolunteerHours(personId),
      getVolunteerSummary(personId),
    ]).then(([h, s]) => {
      setHours(h);
      setSummary(s);
      setLoading(false);
    });
  }, [personId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.hours || Number(form.hours) <= 0) {
      setError("Enter valid hours");
      return;
    }
    if (!form.description.trim()) {
      setError("Description required");
      return;
    }
    if (!form.date) {
      setError("Date required");
      return;
    }

    setSubmitting(true);
    const result = await logVolunteerHours({
      personId,
      hours: Number(form.hours),
      description: form.description.trim(),
      date: form.date,
    });
    setSubmitting(false);

    if (result.success && result.record) {
      setHours((prev) => [result.record!, ...prev]);
      setForm({ hours: "", description: "", date: "" });
      setShowForm(false);
      const s = await getVolunteerSummary(personId);
      setSummary(s);
    } else {
      setError(result.error || "Failed to log hours");
    }
  }

  if (!personId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-semibold text-secondary">Volunteer account required</p>
        <p className="text-xs text-muted-foreground mt-1">
          Apply as a volunteer to start tracking hours.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Summary */}
      {summary && summary.total_hours > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <p className="font-display text-xl font-bold text-secondary">{summary.total_hours}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Hours</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-green-600">{summary.approved_hours}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Approved</p>
          </div>
          <div className="text-center">
            <p className="font-display text-xl font-bold text-amber-600">{summary.pending_hours}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending</p>
          </div>
        </div>
      )}

      {/* Log button */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-muted-foreground">
          {hours.length === 0 ? "No hours logged yet" : `${hours.length} entries`}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-3 w-3" /> Log Hours
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 rounded-lg bg-muted/50 p-3 space-y-2.5">
          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
                Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={form.hours}
                onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="2"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5 block">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="e.g. Community clean-up event"
              maxLength={500}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      )}

      {/* Entries */}
      {hours.length === 0 ? (
        <div className="text-center py-4">
          <Clock className="mx-auto mb-2 h-6 w-6 text-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">Log your first volunteer hours above.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {hours.map((h) => (
            <div key={h.id} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-secondary truncate">{h.description}</p>
                <p className="text-[10px] text-muted-foreground">{formatDate(h.date)} · {h.hours}h</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLE[h.status] ?? ""}`}>
                {h.status === "approved" && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                {h.status === "pending" && <Hourglass className="h-2.5 w-2.5 mr-0.5" />}
                {h.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
