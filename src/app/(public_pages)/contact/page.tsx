"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  Send,
  MessageSquare,
  Clock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import LocationMap from "@/components/ui/expand-map";
import ConsentCheckbox from "@/components/ConsentCheckbox";
import { sendContactMessage } from "./actions";

const faqs = [
  {
    q: "How do I join BMAC?",
    a: "Fill out the membership form on our Get Involved page or visit our office on Nalado Street. New cohorts open quarterly.",
  },
  {
    q: "What are the membership requirements?",
    a: "We accept anyone between ages 16 and 30 who is committed to growth and community service. No prior experience needed.",
  },
  {
    q: "How can I volunteer?",
    a: "We welcome volunteers with skills in facilitation, event planning, and mentoring. Reach out through our contact form.",
  },
  {
    q: "Can schools partner with BMAC?",
    a: "Absolutely. We actively partner with schools and organizations across Plateau State to discuss collaboration.",
  },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-card text-center md:text-left">
        <div className="absolute inset-0 bg-accent/5" style={{ backgroundImage: 'radial-gradient(var(--secondary) 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-primary font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Communication Hub</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-secondary tracking-tighter leading-[0.9]">
                Get in <span className="text-accent italic font-light serif">Touch</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Form - Responsive Padding */}
          <div className="lg:col-span-7">
              <div className="bg-gradient-to-br from-card to-muted/50 rounded-[2rem] md:rounded-bento p-6 md:p-12 shadow-xl border border-border/80 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />
                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-3xl opacity-30 -ml-24 -mb-24 pointer-events-none" />
                 
                 <div className="relative z-10">
                   <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left justify-center sm:justify-start">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary flex-shrink-0 shadow-inner">
                         <MessageSquare size={24} />
                      </div>
                      <div>
                         <h2 className="font-display text-xl md:text-2xl font-bold text-secondary tracking-tight">Send a Message</h2>
                         <p className="text-muted-foreground text-xs md:text-sm">We typically respond within 24 hours.</p>
                      </div>
                   </div>

                   {state?.success && (
                     <div className="relative z-10 mb-6 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                       Message sent — we&apos;ll get back to you within 24 hours.
                     </div>
                   )}
                   {state?.error && (
                     <div className="relative z-10 mb-6 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-600">
                       {state.error}
                     </div>
                   )}

                   <form action={formAction} className="space-y-5 md:space-y-7">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Full Name</label>
                           <input name="name" type="text" placeholder="Peace Jagaban" disabled={pending} className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                        </div>
                        <div className="space-y-2 group">
                           <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Email Address</label>
                           <input name="email" type="email" placeholder="peace@bmacjos.org" disabled={pending} className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                        </div>
                     </div>
                     
                     <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Subject</label>
                        <div className="relative">
                           <select name="subject" disabled={pending} className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 appearance-none cursor-pointer disabled:opacity-60">
                              <option>General Inquiry</option>
                              <option>Membership</option>
                              <option>Partnership</option>
                           </select>
                           <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                        </div>
                     </div>

                     <div className="space-y-2 group">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Detailed Message</label>
                        <textarea name="message" rows={4} placeholder="How can we help?" disabled={pending} className="w-full px-5 md:px-6 py-4 md:py-5 bg-background border border-border/60 rounded-xl md:rounded-2xl text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 resize-none placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                     </div>

                     <ConsentCheckbox consentId="contact" />

                     <button className="group relative w-full py-4 md:py-5 bg-gradient-to-r from-secondary to-primary rounded-xl md:rounded-2xl font-bold text-card hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-secondary/10 active:scale-[0.98] disabled:opacity-70" disabled={pending}>
                        <span className="relative z-10 flex items-center gap-3">
                           {pending ? "Transmitting..." : "Send Message"} 
                           <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                        </span>
                        <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
                     </button>
                   </form>
                 </div>
              </div>
          </div>

           <div className="lg:col-span-5 space-y-6 md:space-y-8">
              <div className="bg-secondary rounded-[2rem] md:rounded-bento p-5 md:p-10 text-secondary-foreground relative overflow-hidden">
                 <h3 className="font-display text-lg md:text-2xl font-bold mb-5 md:mb-8 relative z-10 text-center md:text-left">Direct Contact</h3>
                 
                 <div className="space-y-4 md:space-y-8 relative z-10">
                    {[
                      { icon: <Mail />, label: "Email", value: "hello@bmacjos.org", href: "mailto:hello@bmacjos.org" },
                      { icon: <Phone />, label: "Phone / WhatsApp", value: "+234 803 456 7891", href: "https://wa.me/2348034567891" },
                      { icon: <MapPin />, label: "Hub", value: "Nalado Street, Jos", href: "" },
                      { icon: <Clock />, label: "Hours", value: "Mon - Sat: 9am - 5pm", href: "" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-row items-center gap-3 md:gap-5 text-left">
                         <div className="w-9 h-9 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent flex-shrink-0">
                            {item.icon}
                         </div>
                         <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-secondary-foreground/40 mb-0.5">{item.label}</p>
                            {item.href ? (
                              <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-bold text-sm md:text-base hover:text-accent transition-colors">{item.value}</a>
                            ) : (
                              <p className="font-bold text-sm md:text-base">{item.value}</p>
                            )}
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="h-[250px] md:h-[350px]">
                <LocationMap location="Jos, Plateau State" coordinates="9.9280° N, 8.8721° E" />
             </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-y border-border/50">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
               <span className="section-eyebrow">Knowledge Base</span>
               <h2 className="section-title">Common Questions</h2>
            </div>
            
            <div className="space-y-3 md:space-y-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="bg-card rounded-xl md:rounded-3xl border border-border overflow-hidden shadow-sm transition-all hover:shadow-md">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-5 md:px-8 py-4 md:py-6 flex items-center justify-between text-left group"
                    >
                       <span className="font-display font-bold text-secondary text-sm md:text-base group-hover:text-primary transition-colors pr-4">{faq.q}</span>
                       <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center transition-all flex-shrink-0 ${openFaq === i ? 'rotate-180 bg-primary text-primary-foreground shadow-md shadow-primary/20' : ''}`}>
                          <ChevronDown size={14} className="md:w-4 md:h-4" />
                       </div>
                    </button>
                    <AnimatePresence>
                       {openFaq === i && (
                         <motion.div 
                           initial={{ height: 0, opacity: 0 }} 
                           animate={{ height: 'auto', opacity: 1 }} 
                           exit={{ height: 0, opacity: 0 }} 
                           className="overflow-hidden"
                         >
                            <div className="px-5 md:px-8 pb-5 md:pb-8 text-muted-foreground text-xs md:text-sm leading-relaxed border-t border-border/30 pt-4">
                               {faq.a}
                            </div>
                         </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
               ))}
            </div>
         </div>
      </section>
    </main>
  );
}
