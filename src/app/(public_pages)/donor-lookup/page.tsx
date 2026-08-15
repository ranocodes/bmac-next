"use client";

import { useState } from "react";
import { Search, FileText, Loader2, Mail, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupDonations } from "@/actions/donor-lookup";

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
      <section className="relative overflow-hidden bg-secondary pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="absolute inset-0 bg-primary/5 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        <div className="max-w-3xl mx-auto px-4 md:px-6 w-full relative z-10 text-center">
          <span className="inline-block text-accent font-bold tracking-[0.3em] uppercase text-[10px] mb-4">Donor Self-Service</span>
          <h1 className="font-display text-[clamp(2rem,7vw,3.5rem)] font-extrabold text-card tracking-tighter leading-none mb-4">
            Look Up Your Donations
          </h1>
          <p className="text-card/60 text-sm md:text-base font-medium max-w-lg mx-auto">
            Enter the email you used when donating. We&apos;ll list your donations and give you a tax-deductible receipt for each.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card rounded-bento border border-border/50 p-6 md:p-10 shadow-diffused space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Donation Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-13 md:pl-14 pr-5 py-4 md:py-5 bg-muted/40 border border-border/60 rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            {error && (
              <p className="text-sm font-bold text-red-500 px-2">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full py-4 md:py-5 bg-gradient-to-r from-secondary to-primary text-card rounded-2xl font-extrabold text-sm md:text-base hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Searching...</> : <><Search size={18} /> Find My Donations</>}
            </button>
          </form>

          <AnimatePresence>
            {donations && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="mt-8 space-y-4"
              >
                {donations.length === 0 ? (
                  <div className="text-center py-12 bg-card rounded-bento border border-border/50">
                    <Heart size={28} className="mx-auto text-muted-foreground mb-3" />
                    <p className="font-bold text-secondary">No donations found</p>
                    <p className="text-sm text-muted-foreground mt-1">No completed donations match that email.</p>
                  </div>
                ) : (
                  donations.map((d) => (
                    <div key={d.reference} className="bg-card rounded-bento border border-border/50 p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-diffused">
                      <div>
                        <p className="font-display font-extrabold text-secondary text-lg">
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
                          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-accent text-accent-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-all shrink-0"
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
