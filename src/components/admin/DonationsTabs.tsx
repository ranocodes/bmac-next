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
        <Heart size={24} className="text-primary shrink-0" />
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">Donations</h1>
          <p className="text-sm text-muted-foreground mt-1">Giving records and payment transactions</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-2xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-card text-secondary shadow-sm"
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
