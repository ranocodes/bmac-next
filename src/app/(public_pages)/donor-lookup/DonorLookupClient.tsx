"use client";

import { useState } from "react";
import { Search, FileText, Loader2, Mail, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupDonations } from "@/actions/donor-lookup";
import { Skeleton } from "@/components/ui/Skeleton";

type Donation = {
  reference: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: string;
  receiptUrl: string;
};

export default function DonorLookup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [donations, setDonations] = useState<Donation[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setDonations(null);
    const res = await lookupDonations(email);
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDonations(res.donations || []);
  };

  return (
    <main suppressHydrationWarning className="bg-background min-h-screen">
      <section className="bg-background pt-32 pb-12">
        <div className="max-w-3xl mx-auto px-6 w-full text-center">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Donor Self-Service</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-secondary">
            Look Up Your Donations
          </h1>
          <p className="text-muted-foreground text-sm md:text-base font-medium max-w-lg mx-auto mt-4">
            Enter the email you used when donating. We&apos;ll list your donations and give you a tax-deductible receipt for each.
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 md:p-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Donation Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm font-bold text-red-500">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full py-3.5 bg-primary text-primary-foreground rounded-lg font-bold text-sm flex items-center justify-center gap-2.5 hover:bg-primary/90 transition-colors disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Searching...</> : <><Search size={18} /> Find My Donations</>}
            </button>
          </form>

          {loading && (
            <div className="mt-6 space-y-3" aria-busy="true" aria-label="Searching donations">
              {[0, 1, 2].map((i) => (
                <div key={i} className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2.5">
                    <Skeleton className="h-6 w-32 rounded-md" />
                    <Skeleton className="h-3.5 w-52 rounded-md" />
                    <Skeleton className="h-2.5 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {donations && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="mt-6 space-y-3"
              >
                {donations.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <Heart size={28} className="mx-auto text-muted-foreground mb-3" />
                    <p className="font-bold text-secondary">No donations found</p>
                    <p className="text-sm text-muted-foreground mt-1">No completed donations match that email.</p>
                  </div>
                ) : (
                  donations.map((d) => (
                    <div key={d.reference} className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-display font-bold text-secondary text-lg">
                          {d.currency === "NGN" ? "₦" : `${d.currency} `}{Number(d.amount || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">
                          {d.name} · {new Date(d.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                          {d.reference} · {d.status}
                        </p>
                      </div>
                      {d.status === "completed" && (
                        <a
                          href={d.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-5 h-11 bg-accent text-accent-foreground text-sm font-bold rounded-lg hover:opacity-90 transition-opacity shrink-0"
                        >
                          <FileText size={15} /> Download Receipt
                        </a>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
