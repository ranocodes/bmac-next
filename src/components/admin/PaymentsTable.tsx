"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search } from "lucide-react";

export default function PaymentsTable({ initialData }: { initialData: any[] }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

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

  const filtered = search
    ? payments.filter(p =>
        (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.payer_email || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.source_type || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.source_id || "").toLowerCase().includes(search.toLowerCase())
      )
    : payments;

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <CreditCard size={24} className="text-primary shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Verified Paystack transactions</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reference, email, source..."
          className="w-full h-10 pl-10 pr-4 rounded-xl border border-input bg-card text-sm text-secondary placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl border border-border/50">
          <CreditCard size={48} className="text-muted-foreground/20 mb-4" />
          <p className="text-sm font-medium text-secondary">
            {search ? "No payments match your search" : "No payments yet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? "Try a different term" : "Payments appear here after a Paystack charge is verified"}
          </p>
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left font-semibold text-secondary px-5 py-4">Reference</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden md:table-cell">Source</th>
                  <th className="text-right font-semibold text-secondary px-5 py-4">Amount</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden sm:table-cell">Payer</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4">Status</th>
                  <th className="text-left font-semibold text-secondary px-5 py-4 hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors">
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
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        p.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : p.status === "failed" || p.status === "refunded"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-amber-500/10 text-amber-500"
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
      )}
    </div>
  );
}
