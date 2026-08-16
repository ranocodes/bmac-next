"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Download, Search } from "lucide-react";

export default function PaymentsTable({ initialData, embedded }: { initialData: any[]; embedded?: boolean }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");

  useEffect(() => {
    setPayments([...initialData].reverse());
  }, [initialData]);

  function formatAmount(amount: number | string | undefined, currency: string | undefined) {
    const n = Number(amount || 0) / 100;
    return n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (currency || "NGN");
  }

  function formatTime(ts: string | number) {
    const d = new Date(ts);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  const filtered = useMemo(() => {
    let list = sourceFilter === "all" ? payments : payments.filter(p => p.source_type === sourceFilter);
    if (search) {
      list = list.filter(p =>
        (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.payer_email || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.source_type || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.source_id || "").toLowerCase().includes(search.toLowerCase())
      );
    }
    return list;
  }, [payments, search, sourceFilter]);

  function exportCsv() {
    const headers = ["Reference", "Source", "Source ID", "Amount", "Currency", "Payer Email", "Payer Name", "Status", "Date"];
    const rows = filtered.map(p => [
      p.reference || "",
      p.source_type || "unknown",
      p.source_id || "",
      String(Number(p.amount || 0) / 100),
      p.currency || "NGN",
      p.payer_email || "",
      p.payer_name || "",
      p.status || "",
      p.created_at || "",
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bmac-payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const sources = useMemo(
    () => Array.from(new Set<string>([...payments.map(p => p.source_type).filter(Boolean), "donation"])).sort(),
    [payments]
  );

  return (
    <div className={embedded ? "space-y-6" : "space-y-6 max-w-[1400px]"}>
      {!embedded && (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
            <CreditCard size={18} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Payments</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Verified Paystack transactions</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference, email, source..."
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-border bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <select
          value={sourceFilter}
          onChange={e => setSourceFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-card text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">All sources</option>
          {sources.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="ml-auto inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-sm font-medium text-secondary hover:bg-muted/40 disabled:opacity-50 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border border-border">
          <CreditCard size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search || sourceFilter !== "all" ? "No payments match your filters" : "No payments yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search || sourceFilter !== "all" ? "Try a different term" : "Payments appear here after a Paystack charge is verified"}
          </p>
        </div>
      ) : (
        <>
          <div className="lg:hidden space-y-2">
            {filtered.map(p => (
              <div key={p.id} className="w-full text-left bg-card rounded-xl border border-border px-4 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-secondary truncate">{p.reference}</span>
                    <span className="text-sm font-semibold text-secondary tabular-nums shrink-0">{formatAmount(p.amount, p.currency)}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground truncate">{p.payer_email || "—"}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      p.status === "completed"
                        ? "bg-emerald-50 text-emerald-700"
                        : p.status === "failed" || p.status === "refunded"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {p.status || "pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Reference</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden md:table-cell">Source</th>
                    <th className="text-right text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Amount</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden sm:table-cell">Payer</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5">Status</th>
                    <th className="text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-5 py-3.5 hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs text-secondary">{p.reference}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <div className="text-xs">
                          <span className="font-medium text-secondary">{p.source_type || "unknown"}</span>
                          {p.source_id && <span className="text-muted-foreground"> · {p.source_id}</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-medium text-secondary">{formatAmount(p.amount, p.currency)}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell">
                        <span className="text-muted-foreground text-xs">{p.payer_email || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          p.status === "completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "failed" || p.status === "refunded"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {p.status || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-muted-foreground text-xs whitespace-nowrap">{formatTime(p.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
