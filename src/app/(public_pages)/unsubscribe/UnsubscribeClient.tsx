"use client";

import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnsubscribePage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const email = params.get("email") || "";

  const [step, setStep] = useState<"confirm" | "loading" | "done" | "error">(email ? "confirm" : "error");
  const [errorMsg, setErrorMsg] = useState(email ? "" : "No email address provided.");

  const handleUnsubscribe = async () => {
    setStep("loading");
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        setStep("error");
      } else {
        setStep("done");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStep("error");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {step === "confirm" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto">
              <Mail size={28} className="text-secondary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary mb-2">Unsubscribe</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You&apos;re about to unsubscribe from our newsletter.
              </p>
            </div>
            <div className="bg-muted/40 rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground mb-1">Email address</p>
              <p className="text-sm font-medium text-secondary break-all">{email}</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleUnsubscribe}
                className="w-full px-6 py-3 bg-destructive text-destructive-foreground rounded-xl text-sm font-bold hover:bg-destructive/90 transition-all"
              >
                Yes, unsubscribe me
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
              >
                <ArrowLeft size={12} /> Nevermind, take me back
              </Link>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="space-y-4">
            <Loader2 size={32} className="animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground">Unsubscribing…</p>
          </div>
        )}

        {step === "done" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary mb-2">You&apos;re unsubscribed</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You won&apos;t receive any more newsletters from us. You can always resubscribe later if you change your mind.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
            >
              <ArrowLeft size={12} /> Back to site
            </Link>
          </>
        )}

        {step === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-destructive/5 flex items-center justify-center mx-auto">
              <AlertCircle size={28} className="text-destructive" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-secondary mb-2">Something went wrong</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-secondary transition-colors"
            >
              <ArrowLeft size={12} /> Back to site
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
