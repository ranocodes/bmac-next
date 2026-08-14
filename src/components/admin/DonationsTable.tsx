"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Heart, Search } from "lucide-react";

interface DonationRow {
  id: string;
  personId: string;
  name: string;
  email: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
}

export default function DonationsTable({ initialData }: { initialData: DonationRow[] }) {
  const [donations, setDonations] = useState<DonationRow[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setDonations(initialData);
  }, [initialData]);

  function formatAmount(amount: number) {
    return "₦" + (Number(amount) || 0).toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function formatTime(ts: string) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? donations : donations.filter(d => d.status === statusFilter);
    if (search) {
      list = list.filter(d =>
        (d.reference || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.email || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [donations, search, statusFilter]);

  const totalVerified = donations
    .filter(d => d.status === "completed")
    .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  function exportCsv() {
    const headers = ["Reference", "Name", "Email", "Amount", "Status", "Date"];
    const rows = filtered.map(d => [
      d.reference || "",
      `"${(d.name || "").replace(/"/g, '""')}"`,
      `"${(d.email || "").replace(/"/g, '""')}"`,
      String(Number(d.amount) || 0),
      d.status,
      d.createdAt || "",
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bmac-donations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <Heart size={24} className="text-primary shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Donations</h1>
          <p className="text-sm text-muted-foreground mt-1">Donor records with payment status</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card rounded-3xl border border-border/50 p-5">
          <p className="text-xs text-muted-foreground">Verified total</p>
          <p className="text-2xl font-display font-bold text-secondary mt-1">{formatAmount(totalVerified)}</p>
        </div>
        <div className="bg-card rounded-3xl border border-border/50 p-5">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="text-2xl font-display font-bold text-secondary mt-1">
            {donations.filter(d => d.status === "completed").length}
          </p>
        </div>
        <div className="bg-card rounded-3xl border border-border/50 p-5">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-display font-bold text-secondary mt-1">
            {donations.filter(d => d.status === "pending").length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, email, reference..."
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-input bg-card text-sm font-medium text-secondary hover:bg-muted/40 disabled:opacity-50 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <Heart size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search || statusFilter !== "all" ? "No donations match your filters" : "No donations yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || statusFilter !== "all" ? "Try a different term" : "Donations appear here once someone starts a donation"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Donor</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Reference</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4">Amount</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4">Status</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {(d.name || "?")[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-secondary truncate">{d.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{d.email || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-secondary">{d.reference}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-medium text-secondary">{formatAmount(d.amount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        d.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-500"
                      }`}>
                        {d.status || "pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-muted-foreground text-xs whitespace-nowrap">{formatTime(d.createdAt)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
