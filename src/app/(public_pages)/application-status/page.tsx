"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, FileText, Loader2, Mail, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lookupApplicationStatus } from "@/actions/programs";

type Result = {
  applicationId: string;
  status: string;
  programId: string;
  programTitle: string;
  cohortTitle?: string;
  appliedAt: string;
};

const STATUS_META: Record<string, { label: string; tone: "ok" | "warn" | "bad" | "info"; hint: string }> = {
  submitted: { label: "Submitted", tone: "info", hint: "We've received your application and it's in the queue." },
  in_review: { label: "In Review", tone: "warn", hint: "Our team is reviewing your application." },
  accepted: { label: "Accepted", tone: "ok", hint: "Congratulations — you've been accepted." },
  waitlisted: { label: "Waitlisted", tone: "warn", hint: "You're on the waitlist. We'll reach out if a spot opens." },
  rejected: { label: "Not Selected", tone: "bad", hint: "We're not able to offer a place this round. You're welcome to reapply." },
  withdrawn: { label: "Withdrawn", tone: "info", hint: "This application was withdrawn." },
};

function StatusIcon({ tone }: { tone: string }) {
  if (tone === "ok") return <CheckCircle2 size={18} />;
  if (tone === "bad") return <XCircle size={18} />;
  return <Clock size={18} />;
}

export default function ApplicationStatusPage() {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [results, setResults] = useState<Result[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    setResults([]);
    const res = await lookupApplicationStatus({ email, applicationId: reference || undefined });
    setLoading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.result) {
      setResult(res.result);
    } else if (res.results) {
      setResults(res.results);
    }
  };

  const meta = result ? STATUS_META[result.status] || STATUS_META.submitted : null;

  return (
    <main suppressHydrationWarning className="bg-background min-h-screen">
      <section className="bg-background pt-24 md:pt-32 pb-12 md:pb-16">
        <div className="max-w-3xl mx-auto px-4 md:px-6 w-full text-center">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Applicant Self-Service</span>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight mb-4">
            Check Your Application
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Enter the email you applied with. Optionally add your reference for a specific application.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 md:p-10 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Used</label>
              <div className="relative">
                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-13 md:pl-14 pr-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground/40"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Application Reference <span className="text-muted-foreground/60">(optional)</span></label>
              <div className="relative">
                <FileText size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="app-…"
                  className="w-full pl-13 md:pl-14 pr-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all font-bold placeholder:text-muted-foreground/40"
                />
              </div>
              <p className="text-xs text-muted-foreground px-2">Leave empty to see all your applications.</p>
            </div>
            {error && (
              <p className="text-sm font-bold text-red-500 px-2">{error}</p>
            )}
            <button
              disabled={loading}
              className="w-full py-4 bg-primary text-card rounded-lg font-bold text-sm md:text-base hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Checking...</> : <><Search size={18} /> Check My Status</>}
            </button>
          </form>

          <AnimatePresence>
            {result && meta && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="mt-8"
              >
                <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      meta.tone === "ok" ? "bg-primary/10 text-primary"
                      : meta.tone === "bad" ? "bg-red-500/10 text-red-500"
                      : meta.tone === "warn" ? "bg-amber-500/10 text-amber-600"
                      : "bg-muted text-muted-foreground"
                    }`}>
                      <StatusIcon tone={meta.tone} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                      <h2 className="font-display text-2xl font-bold text-secondary">{meta.label}</h2>
                      <p className="text-sm text-muted-foreground mt-2">{meta.hint}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50 space-y-3 text-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground">Program</span>
                      <span className="font-bold text-secondary text-right">{result.programTitle}</span>
                    </div>
                    {result.cohortTitle && (
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                        <span className="text-muted-foreground">Assigned cohort</span>
                        <span className="font-bold text-secondary text-right">{result.cohortTitle}</span>
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="font-mono font-bold text-secondary text-right">{result.applicationId}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-muted-foreground">Applied</span>
                      <span className="font-bold text-secondary text-right">
                        {new Date(result.appliedAt).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Questions about your application?{" "}
                  <Link href="/contact" className="font-bold text-primary hover:underline">Contact us</Link>
                </p>
              </motion.div>
            )}

            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="mt-8 space-y-4"
              >
                <p className="text-sm font-bold text-secondary">
                  Found {results.length} application{results.length !== 1 ? "s" : ""}
                </p>
                {results.map((r) => {
                  const m = STATUS_META[r.status] || STATUS_META.submitted;
                  return (
                    <div key={r.applicationId} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        m.tone === "ok" ? "bg-primary/10 text-primary"
                        : m.tone === "bad" ? "bg-red-500/10 text-red-500"
                        : m.tone === "warn" ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                      }`}>
                        <StatusIcon tone={m.tone} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-secondary text-sm truncate">{r.programTitle}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            m.tone === "ok" ? "text-primary bg-primary/10"
                            : m.tone === "bad" ? "text-red-500 bg-red-500/10"
                            : m.tone === "warn" ? "text-amber-600 bg-amber-500/10"
                            : "text-muted-foreground bg-muted"
                          }`}>{m.label}</span>
                          <span className="text-xs text-muted-foreground font-mono">{r.applicationId}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.appliedAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted-foreground/40 shrink-0" />
                    </div>
                  );
                })}
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Questions about your application?{" "}
                  <Link href="/contact" className="font-bold text-primary hover:underline">Contact us</Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}
