"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mic, BookOpen, Users, Send, Target, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import Modal from "@/components/Modal";
import { CircularTestimonials } from "@/components/ui/circular-testimonials";
import { BentoCard } from "@/components/ui/BentoCard";

const stats = [
  { num: "350+", label: "Members Trained", icon: <Target size={18}/> },
  { num: "48", label: "Events Hosted", icon: <Zap size={18}/> },
  { num: "12", label: "Partners", icon: <Sparkles size={18}/> },
];

const programs = [
  {
    id: "speaking",
    title: "Public Speaking",
    desc: "From nervous beginners to confident room-commanding speakers.",
    icon: <Mic size={20} />,
    color: "bg-emerald-50 text-emerald-600",
    img: "/images/public-speaking.jpg",
    details: "Weekly practice|Live feedback|Real stages|Saturday 9am",
  },
  {
    id: "literary",
    title: "Literary Arts",
    desc: "A safe space where young voices learn to paint with words.",
    icon: <BookOpen size={20} />,
    color: "bg-amber-50 text-amber-600",
    img: "/images/literary-arts.jpg",
    details: "Creative writing|Poetry slams|Anthologies|Open Mic nights",
  },
  {
    id: "mentorship",
    title: "Mentorship",
    desc: "One-on-one pairing with industry leaders for career growth.",
    icon: <Users size={20} />,
    color: "bg-blue-50 text-blue-600",
    img: "/images/mentorship.jpg",
    details: "1-on-1 sessions|Career pathing|6-month program|Expert alumni",
  },
];

const testimonialData = [
  {
    quote: "Before BMAC, I could barely stand in front of five people. Now I moderate panel discussions across Jos.",
    name: "Ifeoma Nwosu",
    designation: "2025 Cohort Lead",
    src: "/images/unknown.jpg",
  },
  {
    quote: "The mentorship program paired me with a professional who helped me navigate my career in digital arts.",
    name: "Anu Bello",
    designation: "Creative Arts Lead",
    src: "/images/anu.jpg",
  },
  {
    quote: "Joining the workshops gave me the confidence to share my poetry with the world. I've found my voice.",
    name: "Maryam Sani",
    designation: "Spoken Word Poet",
    src: "/images/maryam.jpg",
  },
];

export default function Home() {
  const [selectedProg, setSelectedProg] = useState<any>(null);

  return (
    <main suppressHydrationWarning className="bg-[#fafbf9]">
      {/* Hero Section - High Agency Asymmetric */}
      <section className="relative min-h-[95dvh] flex items-center overflow-hidden pt-20">
         {/* Decorative Refraction */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[120px] -mr-96 -mt-96" />
         
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div
               initial={{ opacity: 0, x: -30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
               <span className="inline-block px-4 py-1.5 mb-8 text-[10px] font-bold tracking-[0.3em] uppercase bg-green/5 border border-green/10 rounded-full text-green">
                  Brilliant Minds ambassadors club
               </span>
               <h1 className="font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold text-deep tracking-tighter leading-[0.9] mb-8">
                  Building the <br/> <span className="text-green italic font-light serif">Confident</span> <br/> Next Era.
               </h1>
               <p className="text-slate-500 text-lg leading-relaxed max-w-lg mb-10">
                  Equipping young leaders in plateau state with public speaking, 
                  literary arts, and digital skills to turn potential into impact.
               </p>
               
               <div className="flex flex-wrap gap-4">
                  <Link href="/get-involved" className="bg-deep text-white px-10 py-5 rounded-full font-bold hover:bg-green transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-3">
                     Join BMAC <ArrowRight size={20} />
                  </Link>
                  <Link href="/programs" className="bg-white text-deep border border-slate-200 px-10 py-5 rounded-full font-bold hover:bg-slate-50 transition-all">
                     View Programs
                  </Link>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, delay: 0.2 }}
               className="relative h-[500px] lg:h-[600px] rounded-[4rem] overflow-hidden shadow-2xl shadow-emerald-900/10 border-8 border-white"
            >
               <Image 
                  src="/images/literary-arts.jpg" 
                  alt="BMAC Members" 
                  fill 
                  priority 
                  className="object-cover" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent" />
               
               {/* Floating Stat Card */}
               <div className="absolute bottom-10 left-10 right-10 bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/20 flex justify-between items-center">
                  {stats.map((stat, i) => (
                    <div key={i} className="text-center">
                       <p className="text-2xl font-display font-extrabold text-deep">{stat.num}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                    </div>
                  ))}
               </div>
            </motion.div>
         </div>
      </section>

      {/* CMS-Ready Uniform Grid for Programs */}
      <section className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
               <div className="max-w-2xl">
                  <span className="text-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Our Ecosystem</span>
                  <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-deep tracking-tighter leading-none">
                     Workshops That <span className="text-green">Redefine</span> Possible.
                  </h2>
               </div>
               <Link href="/programs" className="font-bold text-sm text-green hover:gap-4 transition-all flex items-center gap-2 pb-2">
                  All Workshops <ArrowRight size={16} />
               </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {programs.map((prog, i) => (
                 <BentoCard 
                    key={prog.id} 
                    delay={i * 0.1}
                    className="p-0 overflow-hidden flex flex-col h-full bg-white group border-none shadow-sm hover:shadow-xl transition-all"
                    onClick={() => setSelectedProg(prog)}
                 >
                    {/* Balanced Image UX: Fixed Ratio */}
                    <div className="relative h-56 w-full overflow-hidden shrink-0">
                       <Image src={prog.img} alt={prog.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                       <div className="absolute top-6 left-6 p-3 rounded-2xl bg-white/90 backdrop-blur-md shadow-sm">
                          <div className={prog.color}>{prog.icon}</div>
                       </div>
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow bg-white">
                       <h3 className="font-display text-2xl font-bold text-deep mb-3 tracking-tight">{prog.title}</h3>
                       <p className="text-slate-500 text-sm leading-relaxed mb-8">{prog.desc}</p>
                       <div className="mt-auto pt-6 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Learn More</span>
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green group-hover:text-white transition-colors">
                             <ArrowRight size={18} />
                          </div>
                       </div>
                    </div>
                 </BentoCard>
               ))}
            </div>
         </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-deep overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green rounded-full blur-[120px] opacity-10 -mr-48 -mt-48" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <span className="text-gold font-bold tracking-[0.3em] uppercase text-[10px] mb-4 block">Success Stories</span>
            <h2 className="font-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold text-white tracking-tighter">
               Ambassadors in <span className="text-gold italic font-light serif">Action</span>.
            </h2>
          </div>
          
          <CircularTestimonials
            testimonials={testimonialData}
            autoplay={true}
            colors={{
              name: "#ffffff",
              designation: "#d4a843",
              testimony: "rgba(255,255,255,0.7)",
              arrowBackground: "rgba(255,255,255,0.05)",
              arrowForeground: "#ffffff",
              arrowHoverBackground: "#d4a843",
            }}
            fontSizes={{
              name: "clamp(1.5rem,4vw,2.25rem)",
              designation: "14px",
              quote: "clamp(1rem,3vw,1.25rem)",
            }}
          />
        </div>
      </section>

      {/* Global CTA */}
      <section className="py-32 px-6">
         <div className="max-w-5xl mx-auto">
            <BentoCard className="bg-[#0f6b3e] p-12 md:p-20 text-center relative overflow-hidden border-none shadow-2xl shadow-emerald-900/20">
               <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
               <div className="relative z-10">
                  <h2 className="font-display text-[clamp(2rem,6vw,4rem)] font-extrabold text-white tracking-tighter mb-8 leading-tight">
                     Ready to <span className="text-gold">Speak Boldly</span> <br/> and Lead Fearlessly?
                  </h2>
                  <p className="text-emerald-50 text-lg mb-12 max-w-2xl mx-auto opacity-80">
                     Our next 2026 cohort is gathering soon. Secure your place in a 
                     community that pushes you to be your absolute best.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                     <Link href="/get-involved" className="bg-gold text-deep px-12 py-5 rounded-full font-bold hover:bg-white transition-all shadow-xl shadow-gold/10">
                        Join the Movement
                     </Link>
                     <Link href="/contact" className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold hover:bg-white/20 transition-all">
                        Contact Support
                     </Link>
                  </div>
               </div>
            </BentoCard>
         </div>
      </section>

      {/* Modal - Liquid Glass */}
      <Modal isOpen={!!selectedProg} onClose={() => setSelectedProg(null)}>
        {selectedProg && (
          <div className="bg-white">
            <div className="relative h-64 w-full">
              <Image src={selectedProg.img} alt={selectedProg.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            </div>
            <div className="p-8 md:p-12 -mt-10 relative z-10">
              <span className="text-gold font-bold text-xs uppercase tracking-widest mb-2 block">Workshop Details</span>
              <h2 className="font-display text-4xl font-extrabold text-deep tracking-tight mb-6">{selectedProg.title}</h2>
              
              <div className="grid md:grid-cols-2 gap-12">
                 <div className="space-y-6">
                    <p className="text-slate-500 leading-relaxed">{selectedProg.desc}</p>
                    <div className="space-y-3">
                       {selectedProg.details.split('|').map((d: any, i: number) => (
                         <div key={i} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                            <div className="w-1.5 h-1.5 rounded-full bg-green" />
                            {d}
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                    <h4 className="font-bold text-deep mb-6">Quick Registration</h4>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Enrolled!"); setSelectedProg(null); }}>
                       <input type="text" placeholder="Name" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" required />
                       <input type="email" placeholder="Email" className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-sm" required />
                       <button className="w-full py-4 bg-green text-white font-bold rounded-xl text-sm hover:bg-deep transition-all">Enroll Now</button>
                    </form>
                 </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
