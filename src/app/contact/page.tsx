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
    a: "Fill out the membership form on our Get Involved page or visit our office on Nalado Street. New cohorts open quarterly, and we welcome applicants aged 16-30 who are passionate about personal development.",
  },
  {
    q: "What are the membership requirements?",
    a: "We accept anyone between ages 16 and 30 who is committed to growth and community service. No prior experience is needed — just willingness to learn and contribute.",
  },
  {
    q: "How can I volunteer?",
    a: "We welcome volunteers with skills in facilitation, event planning, writing, and digital media. Reach out through our contact form or email hello@bmacjos.org.",
  },
  {
    q: "Can schools partner with BMAC?",
    a: "Absolutely. We actively partner with schools, NGOs, and organizations across Plateau State to discuss collaboration opportunities.",
  },
];

export default function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState(sendContactMessage, null);

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      <section className="relative min-h-[40dvh] flex items-end pb-12 pt-32 overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[#d4a843]/5" style={{ backgroundImage: 'radial-gradient(#0a2e1c 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
           >
              <span className="text-green font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Communication Hub</span>
              <h1 className="font-display text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-[#0a2e1c] tracking-tighter leading-[0.9]">
                Get in <span className="text-gold italic font-light serif">Touch</span>.
              </h1>
           </motion.div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Form - Liquid Glass */}
          <div className="lg:col-span-7">
             <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-emerald-900/5 border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-green">
                        <MessageSquare size={24} />
                     </div>
                     <div>
                        <h2 className="font-display text-2xl font-bold text-deep tracking-tight">Send a Message</h2>
                        <p className="text-slate-400 text-sm">We typically respond within 24 hours.</p>
                     </div>
                  </div>

                  <form action={formAction} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Full Name</label>
                          <input name="name" type="text" placeholder="Peace Jagaban" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</label>
                          <input name="email" type="email" placeholder="peace@bmacjos.org" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all" required />
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Message Subject</label>
                       <select name="subject" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all">
                          <option>General Inquiry</option>
                          <option>Membership Question</option>
                          <option>Partnership Proposal</option>
                          <option>Donation Help</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Detailed Message</label>
                       <textarea name="message" rows={5} placeholder="How can we help you grow?" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green/20 transition-all resize-none" required />
                    </div>

                    <button className="w-full py-5 bg-deep text-white rounded-2xl font-bold hover:bg-green transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/10" disabled={pending}>
                       {pending ? "Transmitting..." : "Send Message"} 
                       <Send size={18} />
                    </button>

                    <AnimatePresence>
                      {state?.success && (
                        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-bold text-green text-center">Message delivered successfully!</motion.p>
                      )}
                    </AnimatePresence>
                  </form>
                </div>
             </div>
          </div>

          {/* Info & Details */}
          <div className="lg:col-span-5 space-y-8">
             <div className="bg-deep rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold rounded-full blur-[80px] opacity-10 -ml-24 -mb-24" />
                <h3 className="font-display text-2xl font-bold mb-10 relative z-10">Direct Contact</h3>
                
                <div className="space-y-8 relative z-10">
                   {[
                     { icon: <Mail />, label: "Email Support", value: "hello@bmacjos.org" },
                     { icon: <Phone />, label: "Phone Line", value: "+234 803 456 7891" },
                     { icon: <MapPin />, label: "Headquarters", value: "Nalado Street, Jos, Nigeria" },
                     { icon: <Clock />, label: "Active Hours", value: "Mon - Sat: 9am - 5pm" },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-5">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gold">
                           {item.icon}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">{item.label}</p>
                           <p className="font-bold text-sm">{item.value}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="relative h-[300px] rounded-[3rem] overflow-hidden border border-slate-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31226.39734639848!2d8.8721!3d9.9280!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104b42f0c5e0e7e7%3A0x1e2e2e2e2e2e2e2e!2sJos%2C%20Plateau%20State%2C%20Nigeria!5e0!3m2!1sen!2sng!4v1714600000000!5m2!1sen!2sng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg border border-white/20">
                   <div className="flex items-center gap-3 text-xs font-bold text-deep">
                      <MapPin size={14} className="text-green" />
                      Visit Our Hub in Jos
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion - Clean Design */}
      <section className="py-24 px-6 bg-slate-50">
         <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
               <span className="section-eyebrow">Knowledge Base</span>
               <h2 className="section-title">Common Questions</h2>
            </div>
            
            <div className="space-y-4">
               {faqs.map((faq, i) => (
                 <div key={i} className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
                    <button 
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full px-8 py-6 flex items-center justify-between text-left group"
                    >
                       <span className="font-display font-bold text-deep group-hover:text-green transition-colors">{faq.q}</span>
                       <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center transition-transform duration-300 ${openFaq === i ? 'rotate-180 bg-green text-white' : ''}`}>
                          <ChevronDown size={18} />
                       </div>
                    </button>
                    <AnimatePresence>
                       {openFaq === i && (
                         <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                            <div className="px-8 pb-8 text-slate-500 text-sm leading-relaxed">
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
