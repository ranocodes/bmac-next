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

export default function Contact({ contactInfo }: { contactInfo?: { email?: string; phone?: string; whatsapp?: string; address?: string; hours?: string } }) {
  const info = {
    email: contactInfo?.email || "hello@bmacjos.org",
    phone: contactInfo?.phone || "+234 803 456 7891",
    whatsapp: contactInfo?.whatsapp || "2348034567891",
    address: contactInfo?.address || "Nalado Street, Jos",
    hours: contactInfo?.hours || "Mon - Sat: 9am - 5pm",
  };
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  return (
    <main suppressHydrationWarning className="bg-background">
      <section className="pt-24 md:pt-32 pb-10 md:pb-16 bg-background text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 w-full">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.6 }}
           >
              <span className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4 block">Communication Hub</span>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight">
                Get in <span className="text-primary">Touch</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-10 md:py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Contact Form - Responsive Padding */}
          <div className="lg:col-span-7">
              <div className="bg-card border border-border rounded-xl p-6 md:p-12">
                 <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left justify-center sm:justify-start">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                       <MessageSquare size={24} />
                    </div>
                    <div>
                       <h2 className="font-display text-xl md:text-2xl font-bold text-secondary tracking-tight">Send a Message</h2>
                       <p className="text-muted-foreground text-xs md:text-sm">We typically respond within 24 hours.</p>
                    </div>
                 </div>

                 {state?.success && (
                   <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
                     Message sent — we&apos;ll get back to you within 24 hours.
                   </div>
                 )}
                 {state?.error && (
                   <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-600">
                     {state.error}
                   </div>
                 )}

                 <form action={formAction} className="space-y-5 md:space-y-7">
                   <input type="text" name="company_website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-7">
                      <div className="space-y-2 group">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Full Name</label>
                         <input name="name" type="text" placeholder="Peace Jagaban" disabled={pending} className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                      </div>
                      <div className="space-y-2 group">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Email Address</label>
                         <input name="email" type="email" placeholder="peace@bmacjos.org" disabled={pending} className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                      </div>
                   </div>
                   
                   <div className="space-y-2 group">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Subject</label>
                      <div className="relative">
                         <select name="subject" disabled={pending} className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 appearance-none cursor-pointer disabled:opacity-60">
                            <option>General Inquiry</option>
                            <option>Membership</option>
                            <option>Partnership</option>
                         </select>
                         <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
                      </div>
                   </div>

                   <div className="space-y-2 group">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2 group-focus-within:text-primary transition-colors">Detailed Message</label>
                      <textarea name="message" rows={4} placeholder="How can we help?" disabled={pending} className="w-full px-5 py-4 bg-background border border-border/60 rounded-lg text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-300 resize-none placeholder:text-muted-foreground/40 disabled:opacity-60" required />
                   </div>

                   <ConsentCheckbox consentId="contact" />

                   <button className="w-full py-4 bg-primary rounded-lg font-bold text-card hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-70" disabled={pending}>
                      {pending ? "Transmitting..." : "Send Message"} 
                      <Send size={18} />
                   </button>
                 </form>
              </div>
          </div>

           <div className="lg:col-span-5 space-y-6 md:space-y-8">
              <div className="bg-card border border-border rounded-xl p-5 md:p-10">
                 <h3 className="font-display text-lg md:text-2xl font-bold text-secondary mb-5 md:mb-8 text-center md:text-left">Direct Contact</h3>
                 
                 <div className="space-y-4 md:space-y-8">
                     {[
                       { icon: <Mail />, label: "Email", value: info.email, href: `mailto:${info.email}` },
                       { icon: <Phone />, label: "Phone / WhatsApp", value: info.phone, href: `https://wa.me/${info.whatsapp}` },
                       { icon: <MapPin />, label: "Hub", value: info.address, href: "" },
                       { icon: <Clock />, label: "Hours", value: info.hours, href: "" },
                     ].map((item, i) => (
                      <div key={i} className="flex flex-row items-center gap-3 md:gap-5 text-left">
                         <div className="w-9 h-9 md:w-12 md:h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary flex-shrink-0">
                            {item.icon}
                         </div>
                         <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{item.label}</p>
                            {item.href ? (
                              <a href={item.href} target="_blank" rel="noopener noreferrer" className="font-bold text-sm md:text-base text-secondary hover:text-primary transition-colors">{item.value}</a>
                            ) : (
                              <p className="font-bold text-sm md:text-base text-secondary">{item.value}</p>
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
                 <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-5 md:px-8 py-4 md:py-6 flex items-center justify-between text-left group"
                    >
                       <span className="font-display font-bold text-secondary text-sm md:text-base group-hover:text-primary transition-colors pr-4">{faq.q}</span>
                       <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center transition-colors flex-shrink-0 ${openFaq === i ? 'rotate-180 bg-primary text-card' : 'text-muted-foreground'}`}>
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
