import { getDonationTotals } from "@/lib/donations";

export default async function DonationProgress() {
  let totals;
  try {
    totals = await getDonationTotals();
  } catch {
    totals = null;
  }
  if (!totals || totals.goal <= 0) return null;

  const pct = Math.min(100, Math.round((totals.totalKobo / (totals.goal * 100)) * 100));

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <p className="font-display font-extrabold text-secondary text-lg md:text-xl">
          ₦{totals.totalNaira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
        </p>
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
          of ₦{totals.goal.toLocaleString("en-NG")} raised
        </p>
      </div>
      <div className="h-3 md:h-4 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-3 text-[11px] md:text-xs font-medium text-muted-foreground">
        {totals.count > 0 ? `${totals.count} donations so far` : "Be the first to give"} — every naira powers youth leadership in Plateau State.
      </p>
    </div>
  );
}
