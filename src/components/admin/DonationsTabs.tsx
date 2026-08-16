"use client";

import { useState } from "react";
import { Heart, CreditCard } from "lucide-react";
import DonationsTable from "./DonationsTable";
import PaymentsTable from "./PaymentsTable";

export default function DonationsTabs({
  donations,
  payments,
}: {
  donations: any[];
  payments: any[];
}) {
  const [tab, setTab] = useState<"donations" | "payments">("donations");

  const tabs = [
    { key: "donations" as const, label: "Donations", icon: Heart },
    { key: "payments" as const, label: "Payments Ledger", icon: CreditCard },
  ];

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-muted text-secondary flex items-center justify-center">
          <Heart size={18} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-secondary">Donations</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Giving records and payment transactions</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-secondary"
                : "text-muted-foreground hover:text-secondary"
            }`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "donations" ? (
        <DonationsTable initialData={donations} embedded />
      ) : (
        <PaymentsTable initialData={payments} embedded />
      )}
    </div>
  );
}
