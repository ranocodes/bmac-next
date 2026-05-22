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
             <div className="bg-card rounded-[2rem] md:rounded-bento p-6 md:p-12 shadow-xl border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-center sm:text-left justify-center sm:justify-start">
                     <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <MessageSquare size={24} />
                     </div>
                     <div>
                        <h2 className="font-display text-xl md:text-2xl font-bold text-secondary tracking-tight">Send a Message</h2>
                        <p className="text-muted-foreground text-xs md:text-sm">We typically respond within 24 hours.</p>
                     </div>
                  </div>

                  <form action={formAction} className="space-y-4 md:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                          <input name="name" type="text" placeholder="Peace Jagaban" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                          <input name="email" type="email" placeholder="peace@bmacjos.org" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" required />
                       </div>
                    </div>
                    
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Subject</label>
                       <select name="subject" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                          <option>General Inquiry</option>
                          <option>Membership</option>
                          <option>Partnership</option>
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Detailed Message</label>
                       <textarea name="message" rows={4} placeholder="How can we help?" className="w-full px-5 md:px-6 py-3.5 md:py-4 bg-muted/30 border border-border rounded-xl md:rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" required />
                    </div>

                    <button className="w-full py-4 md:py-5 bg-secondary text-secondary-foreground rounded-xl md:rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/10" disabled={pending}>
                       {pending ? "Transmitting..." : "Send Message"} 
                       <Send size={18} />
                    </button>
                  </form>
                </div>
             </div>
          </div>

          <div className="lg:col-span-5 space-y-6 md:space-y-8">
             <div className="bg-secondary rounded-[2rem] md:rounded-bento p-8 md:p-10 text-secondary-foreground relative overflow-hidden">
                <h3 className="font-display text-xl md:text-2xl font-bold mb-8 relative z-10 text-center md:text-left">Direct Contact</h3>
                
                <div className="space-y-6 md:space-y-8 relative z-10">
                   {[
                     { icon: <Mail />, label: "Email", value: "hello@bmacjos.org" },
                     { icon: <Phone />, label: "Phone", value: "+234 803 456 7891" },
                     { icon: <MapPin />, label: "Hub", value: "Nalado Street, Jos" },
                     { icon: <Clock />, label: "Hours", value: "Mon - Sat: 9am - 5pm" },
                   ].map((item, i) => (
                     <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5 text-center sm:text-left">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-card/5 border border-card/10 flex items-center justify-center text-accent flex-shrink-0">
                           {item.icon}
                        </div>
                        <div>
                           <p className="text-[9px] font-bold uppercase tracking-widest text-secondary-foreground/40 mb-0.5">{item.label}</p>
                           <p className="font-bold text-sm md:text-base">{item.value}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="relative h-[250px] md:h-[350px] rounded-[2rem] md:rounded-bento overflow-hidden border border-border">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31226.39734639848!2d8.8721!3d9.9280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104b42f0c5e0e7e7%3A0x1e2e2e2e2e2e2e2e!2sJos%2C%20Plate%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1714600000000!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
                <div className="absolute bottom-4 left-4 right-4 md:right-auto md:left-6 bg-card/90 backdrop-blur-md px-5 py-2.5 rounded-xl md:rounded-2xl shadow-lg border border-card/20 text-center md:text-left">
                   <div className="flex items-center justify-center md:justify-start gap-2.5 text-[10px] md:text-xs font-bold text-secondary">
                      <MapPin size={14} className="text-primary" />
                      Our Hub in Jos
                   </div>
                </div>
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
