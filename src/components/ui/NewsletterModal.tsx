"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, ArrowRight } from "lucide-react";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function NewsletterModal({ isOpen, onClose, title = "Stay Updated with BMAC" }: NewsletterModalProps) {
  const [step, setStep] = useState<'subscribe' | 'thankyou'>('subscribe');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <button className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors" onClick={onClose}>
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
                  <input type="email" placeholder="Your Email Address" className="w-full px-5 py-4 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                  <button className="w-full py-4 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-primary transition-all shadow-lg shadow-primary/10">
                    Subscribe
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
                   <button className="w-full py-4 bg-accent text-accent-foreground rounded-xl text-sm font-bold hover:bg-card border border-accent transition-all">
                      Support Our Work
                   </button>
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
