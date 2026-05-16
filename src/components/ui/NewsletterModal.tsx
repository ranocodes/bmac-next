"use client";

import { useState } from "react";
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
            className="absolute inset-0 bg-deep/40 backdrop-blur-sm" 
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl z-10"
          >
            <button className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={onClose}>
              <X size={20} className="text-slate-400" />
            </button>

            {step === 'subscribe' ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-green/10 text-green flex items-center justify-center mx-auto mb-6">
                  <Send size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-deep mb-3">{title}</h3>
                <p className="text-slate-500 text-sm mb-8">Get the latest stories, workshop alerts, and leadership tips every Friday.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="email" placeholder="Your Email Address" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20" required />
                  <button className="w-full py-4 bg-deep text-white rounded-xl text-sm font-bold hover:bg-green transition-all shadow-lg shadow-emerald-900/10">
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
                <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto mb-6">
                  <Heart size={28} />
                </div>
                <h3 className="font-display text-2xl font-bold text-deep mb-3">You're on the list!</h3>
                <p className="text-slate-500 text-sm mb-8">Thanks for joining our community of young ambassadors. Every contribution helps us empower more lives in Jos.</p>
                <div className="space-y-3">
                   <button className="w-full py-4 bg-gold text-deep rounded-xl text-sm font-bold hover:bg-white border border-gold transition-all">
                      Support Our Work
                   </button>
                   <button onClick={onClose} className="w-full py-4 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-deep transition-colors">
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
