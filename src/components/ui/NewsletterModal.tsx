"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { subscribeToNewsletter } from "@/actions/newsletter";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function NewsletterModal({ isOpen, onClose, title = "Stay Updated with BMAC" }: NewsletterModalProps) {
  const [step, setStep] = useState<'subscribe' | 'thankyou' | 'error'>('subscribe');
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const result = await subscribeToNewsletter(email, { company_website: website });
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setStep('thankyou');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-secondary/40 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-card rounded-bento p-8 shadow-2xl z-10"
          >
            <button className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors" onClick={onClose} aria-label="Close">
              <X size={20} className="text-muted-foreground" />
            </button>

            {step === 'subscribe' ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
                  <Send size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-secondary mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm mb-8">Get the latest stories, workshop alerts, and leadership tips every Friday.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="newsletter_company_website">Website</label>
                    <input type="text" id="newsletter_company_website" name="company_website" tabIndex={-1} autoComplete="off"
                      value={website} onChange={e => setWebsite(e.target.value)} />
                  </div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Your Email Address"
                    className="w-full px-5 py-4 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                  {error && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-destructive/5 border border-destructive/15 rounded-xl text-destructive text-sm">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                  <button disabled={loading}
                    className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Subscribing...</> : "Subscribe"}
                  </button>
                </form>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-secondary mb-3">You're on the list!</h3>
                <p className="text-muted-foreground text-sm mb-8">Thanks for joining our community of young ambassadors. Every contribution helps us empower more lives in Jos.</p>
                <div className="space-y-3">
                   <Link href="/get-involved" onClick={onClose} className="w-full block py-4 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:bg-card border border-accent transition-all text-center">
                      Support Our Work
                   </Link>
                   <button onClick={onClose} className="w-full py-4 text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-secondary transition-colors">
                      Back to site
                   </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
