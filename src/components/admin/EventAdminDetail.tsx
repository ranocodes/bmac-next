"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle2, TicketCheck, Wallet, Download, Bell, RefreshCcw, Calendar, MapPin, Clock3, XCircle, ListOrdered, Trash2 } from "lucide-react";
import { getEventAdminDetail, exportEventRegistrants, setEventCheckedIn, setCapacityUsedOverride, sendEventReminders, verifyEventPayment } from "@/actions/events";
import { listWaitlist, promoteFromWaitlist, removeFromWaitlist, type WaitlistEntry } from "@/actions/waitlist";
import PaymentVerificationModal from "./PaymentVerificationModal";
import { useToast } from "@/components/ui/Toast";
import { useAdmin } from "@/lib/auth/admin-context";
import type { EventAdminDetail } from "@/actions/events";

export default function EventAdminDetailClient({ initialData, eventId }: { initialData: EventAdminDetail; eventId: string }) {
  const [data, setData] = useState<EventAdminDetail>(initialData);
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [capacityInput, setCapacityInput] = useState<string>(String(initialData.event.capacity_used));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"registrants" | "waitlist">("registrants");
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [waitlistLoaded, setWaitlistLoaded] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;
  const [verifyingPaymentFor, setVerifyingPaymentFor] = useState<any | null>(null);
  const { toast, confirm } = useToast();
  const admin = useAdmin();
  const canExport = admin?.permissions?.includes("export_data");

  const { event, registrants } = data;

  async function refresh() {
    const next = await getEventAdminDetail(eventId);
    if (next) setData(next);
  }

  async function toggleCheckIn(ticketId: string, checkedIn: boolean, name: string) {
    if (checkedIn) {
      const ok = await confirm(`Undo check-in for ${name}?`);
      if (!ok) return;
    }
    setBusy(true);
    const res = await setEventCheckedIn(ticketId, checkedIn);
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast(checkedIn ? "Check-in undone" : "Checked in");
    }
    await refresh();
    setBusy(false);
  }

  async function handleExport() {
    setExporting(true);
    const rows = await exportEventRegistrants(eventId);
    const header = ["Reference", "Name", "Email", "Phone", "Quantity", "Amount", "Status", "Checked In", "Registered At"];
    const csv = [
      header.join(","),
      ...rows.map(r => [
        r.reference,
        `"${(r.payerName || "").replace(/"/g, '""')}"`,
        `"${(r.payerEmail || "").replace(/"/g, '""')}"`,
        `"${(r.phone || "").replace(/"/g, '""')}"`,
        r.quantity,
        r.amount,
        r.status,
        r.checkedIn ? "yes" : "no",
        new Date(r.createdAt).toISOString(),
      ].join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-")}-registrants.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`Exported ${rows.length} registrants`);
    setExporting(false);
  }

  async function handleCapacityOverride() {
    const n = Number(capacityInput);
    if (isNaN(n) || n < 0) {
      toast("Enter a valid number", "error");
      return;
    }
    setBusy(true);
    const res = await setCapacityUsedOverride(eventId, n);
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast("Capacity used updated");
      await refresh();
    }
    setBusy(false);
  }

  async function handleSendReminders() {
    const ok = await confirm("Send event reminder emails to all confirmed attendees?", { confirmText: "Send", variant: "default" });
    if (!ok) return;
    setBusy(true);
    const res = await sendEventReminders(eventId);
    setBusy(false);
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast(`Sent ${res.sent} reminders`);
    }
  }

  async function loadWaitlist() {
    const entries = await listWaitlist(eventId);
    setWaitlist(entries);
    setWaitlistLoaded(true);
  }

  async function switchTab(tab: "registrants" | "waitlist") {
    setActiveTab(tab);
    if (tab === "waitlist" && !waitlistLoaded) {
      await loadWaitlist();
    }
  }

  async function handlePromote(entry: WaitlistEntry) {
    const ok = await confirm(`Promote ${entry.name} from waitlist?`);
    if (!ok) return;
    setBusy(true);
    const res = await promoteFromWaitlist(eventId, 1);
    setBusy(false);
    if (res.error) {
      toast(res.error, "error");
    } else if (res.promoted === 0) {
      toast("No capacity available or promotion failed", "error");
    } else {
      toast(`${entry.name} promoted to registration`);
      await loadWaitlist();
      await refresh();
    }
  }

  async function handleRemoveFromWaitlist(entry: WaitlistEntry) {
    const ok = await confirm(`Remove ${entry.name} from waitlist?`);
    if (!ok) return;
    setBusy(true);
    const res = await removeFromWaitlist(entry.id);
    setBusy(false);
    if (res.error) {
      toast(res.error, "error");
    } else {
      toast(`${entry.name} removed from waitlist`);
      await loadWaitlist();
    }
  }

  async function handleVerifyPayment(ticketId: string) {
    const res = await verifyEventPayment(ticketId);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Payment confirmed — pass email sent to attendee");
    setVerifyingPaymentFor(null);
    await refresh();
  }

  const pct = event.capacity > 0 ? Math.min(100, Math.round((event.capacity_used / event.capacity) * 100)) : 0;
  const currency = "₦";
  const revenueLabel = `${currency}${event.revenue.toLocaleString("en-NG")}`;

  const filtered = registrants.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.payerName, r.payerEmail, r.reference, r.phone].some(v => (v || "").toLowerCase().includes(q));
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const stats = [
    { label: "Total registrations", value: String(event.registrations), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Confirmed", value: String(event.confirmed), icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Checked in", value: String(event.checkedIn), icon: TicketCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Attendance rate", value: `${event.attendanceRate}%`, icon: TicketCheck, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Revenue", value: revenueLabel, icon: Wallet, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Pending", value: String(event.pending), icon: Clock3, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Cancelled", value: String(event.cancelled), icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors mb-2">
            <ArrowLeft size={14} /> Events
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">{event.title}</h1>
          <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {event.date || "—"}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {event.venue || "—"}</span>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium text-muted-foreground">{event.category}</span>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${event.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>{event.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${eventId}/edit`} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors">
            Edit
          </Link>
          <button onClick={handleSendReminders} disabled={busy} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
            <Bell size={15} /> Send Reminders
          </button>
          {canExport && (
            <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
              <Download size={15} /> {exporting ? "Exporting…" : "Export CSV"}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-secondary">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
          <h2 className="font-semibold text-secondary mb-4">Capacity</h2>
          <div className="flex items-end justify-between mb-2">
            <p className="text-3xl font-bold text-secondary">
              {event.capacity_used.toLocaleString()}
              <span className="text-base font-medium text-muted-foreground"> / {event.capacity > 0 ? event.capacity.toLocaleString() : "∞"}</span>
            </p>
            <p className="text-sm font-semibold text-muted-foreground">{pct}%</p>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 max-w-[180px]">
              <input
                type="number"
                min={0}
                value={capacityInput}
                onChange={e => setCapacityInput(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button onClick={handleCapacityOverride} disabled={busy} className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted transition-colors disabled:opacity-50">
              <RefreshCcw size={14} /> Override used count
            </button>
            <span className="text-xs text-muted-foreground hidden md:block">For manual corrections</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold text-secondary mb-4">Registration</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Deadline</dt><dd className="font-semibold text-secondary">{event.registration_deadline || "None"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Max per person</dt><dd className="font-semibold text-secondary">{event.max_per_person}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Public registration</dt><dd className="font-semibold text-secondary">{event.allow_public_registration ? "Open" : "Closed"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Reminders</dt><dd className="font-semibold text-secondary">{event.reminders_enabled ? "On" : "Off"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Pricing</dt><dd className="font-semibold text-secondary">{event.is_paid ? `${currency}${Number(event.price).toLocaleString("en-NG")}` : "Free"}</dd></div>
          </dl>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => switchTab("registrants")}
              className={`text-sm font-semibold transition-colors ${activeTab === "registrants" ? "text-primary" : "text-muted-foreground hover:text-secondary"}`}
            >
              Registrants
            </button>
            <button
              onClick={() => switchTab("waitlist")}
              className={`text-sm font-semibold transition-colors ${activeTab === "waitlist" ? "text-primary" : "text-muted-foreground hover:text-secondary"}`}
            >
              Waitlist ({waitlist.filter(w => w.status === "waiting").length})
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {activeTab === "registrants"
              ? `${filtered.length} shown of ${registrants.length} total`
              : `${waitlist.filter(w => w.status === "waiting").length} on waitlist`}
          </span>
        </div>
        {activeTab === "registrants" && (
          <>
          <div className="px-6 py-3 border-b border-border/50 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search name, email, reference…"
                className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1">
              {["all", "confirmed", "pending", "cancelled"].map(s => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users size={40} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm font-medium text-secondary">No registrations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Registrations will appear here once people sign up.</p>
          </div>
        ) : (
          <>
          {/* Desktop table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Attendee</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Reference</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Status</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden lg:table-cell">Qty</th>
                  <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden lg:table-cell">Amount</th>
                  <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-24">Check-in</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map(r => (
                  <tr key={r.ticketId} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-medium text-secondary">{r.payerName || "—"}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.payerEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-mono text-xs hidden md:table-cell">{r.reference}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {r.status === "pending" ? (
                        <button
                          onClick={() => setVerifyingPaymentFor(r)}
                          className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                        >
                          {r.status}
                        </button>
                      ) : (
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          r.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                        }`}>{r.status}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{r.quantity}</td>
                    <td className="px-5 py-4 text-muted-foreground hidden lg:table-cell">{r.amount ? `${currency}${(Number(r.amount) * r.quantity / 100).toLocaleString("en-NG")}` : "—"}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => toggleCheckIn(r.ticketId, r.checkedIn, r.payerName || "attendee")}
                        disabled={busy || r.status !== "confirmed"}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                          r.checkedIn ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        <TicketCheck size={13} /> {r.checkedIn ? "Checked in" : "Check in"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-border/50">
            {pageRows.map(r => (
              <div key={r.ticketId} className="px-5 py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-secondary truncate">{r.payerName || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{r.payerEmail}</p>
                    <p className="text-[11px] text-muted-foreground/60 font-mono mt-0.5">{r.reference}</p>
                  </div>
                  <button
                    onClick={() => toggleCheckIn(r.ticketId, r.checkedIn, r.payerName || "attendee")}
                    disabled={busy || r.status !== "confirmed"}
                    className={`shrink-0 inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                      r.checkedIn ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    <TicketCheck size={13} /> {r.checkedIn ? "Checked in" : "Check in"}
                  </button>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {r.status === "pending" ? (
                    <button
                      onClick={() => setVerifyingPaymentFor(r)}
                      className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                    >
                      {r.status}
                    </button>
                  ) : (
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      r.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-muted text-muted-foreground"
                    }`}>{r.status}</span>
                  )}
                  <span className="text-muted-foreground">Qty: {r.quantity}</span>
                  {r.amount ? <span className="text-muted-foreground">{currency}{(Number(r.amount) * r.quantity / 100).toLocaleString("en-NG")}</span> : null}
                </div>
              </div>
            ))}
          </div>
          </>
        )}
        {activeTab === "registrants" && pageCount > 1 && (
          <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Page {safePage} of {pageCount}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(safePage - 1)}
                disabled={safePage <= 1}
                className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-secondary hover:bg-muted transition-colors disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(safePage + 1)}
                disabled={safePage >= pageCount}
                className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-semibold text-secondary hover:bg-muted transition-colors disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

          </>
        )}

        {activeTab === "waitlist" && (
          <div className="overflow-x-auto">
            {waitlist.filter(w => w.status === "waiting").length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ListOrdered size={40} className="text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-secondary">No one on the waitlist</p>
                <p className="text-xs text-muted-foreground mt-1">Waitlisted registrations will appear here.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">#</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Name</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Email</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Joined</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Status</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.map((w, i) => (
                    <tr key={w.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4 text-muted-foreground text-xs font-mono">{i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-secondary">{w.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{w.email}</p>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-xs text-muted-foreground">{w.email}</td>
                      <td className="px-5 py-4 hidden md:table-cell text-xs text-muted-foreground">
                        {w.createdAt ? new Date(w.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          w.status === "waiting" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"
                        }`}>{w.status}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {w.status === "waiting" && (
                            <>
                              <button
                                onClick={() => handlePromote(w)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                              >
                                <CheckCircle2 size={13} /> Promote
                              </button>
                              <button
                                onClick={() => handleRemoveFromWaitlist(w)}
                                disabled={busy}
                                className="p-2 rounded-lg text-destructive hover:bg-destructive/10 disabled:opacity-40 transition-colors"
                                title="Remove from waitlist"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {w.status === "promoted" && (
                            <span className="text-xs text-green-600 font-medium">Promoted</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
      {verifyingPaymentFor && (
        <PaymentVerificationModal
          attendee={verifyingPaymentFor}
          onConfirm={handleVerifyPayment}
          onClose={() => setVerifyingPaymentFor(null)}
        />
      )}
    </div>
  );
}
