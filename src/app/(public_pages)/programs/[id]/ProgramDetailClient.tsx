"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Users, Clock, Send, MapPin, CheckCircle, ArrowLeft, Sparkles, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import FadeIn from "@/components/FadeIn";
import { BentoCard } from "@/components/ui/BentoCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareButtons from "@/components/ui/ShareButtons";
import type { Program } from "@/types/cms";
import { cn } from "@/lib/utils";
import { getIcon } from "@/lib/iconMapper";
import type { ProgramInstructor } from "@/types/cms";
import StatusBanner from "@/components/admin/StatusBanner";

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function InstructorCard({ instructor, color, index }: { instructor: ProgramInstructor; color: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref);

  const colorMap: Record<string, string> = {
    "text-emerald-400": "ring-emerald-400/60",
    "text-blue-400": "ring-blue-400/60",
    "text-purple-400": "ring-purple-400/60",
    "text-amber-400": "ring-amber-400/60",
    "text-rose-400": "ring-rose-400/60",
    "text-cyan-400": "ring-cyan-400/60",
    "text-primary": "ring-primary/60",
    "text-accent": "ring-accent/60",
  };
  const ringColor = colorMap[color] || "ring-primary/60";

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-gradient-to-br from-card/80 to-card backdrop-blur-sm p-6 md:p-8 flex flex-col items-center text-center transition-all duration-700 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      )}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {instructor.photo ? (
        <div className={cn("relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-3 ring-offset-2 ring-offset-card shadow-lg mb-4", ringColor)}>
          <Image src={instructor.photo} alt={instructor.name} fill className="object-cover" sizes="96px" />
        </div>
      ) : (
        <div className={cn("w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 ring-3 ring-offset-2 ring-offset-card shadow-lg", ringColor)}>
          <Users size={32} />
        </div>
      )}
      <p className="font-display text-lg md:text-xl font-bold text-secondary">{instructor.name}</p>
      {instructor.role && (
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mt-1.5">{instructor.role}</p>
      )}
    </div>
  );
}

interface ProgramDetailClientProps {
  id: string;
  initialPrograms: any[];
}

export default function ProgramDetailClient({ id, initialPrograms }: ProgramDetailClientProps) {
  const all = initialPrograms.map(p => ({
    ...p,
    desc: (p as any).desc || (p as any).description || "",
    longDesc: (p as any).longDesc || (p as any).long_desc || "",
    img: (p as any).img || (p as any).img_url || "",
    icon: (p as any).icon || (p as any).icon_name || "",
    color: (p as any).color || (p as any).color_class || "",
    skills: (p as any).skills || [],
    faqs: (p as any).faqs || [],
    landingPage: (p as any).landingPage || false,
    status: (p as any).status || "draft",
    applicationsOpen: (p as any).applications_open ?? (p as any).applicationsOpen ?? false,
    isPaid: (p as any).is_paid ?? (p as any).isPaid ?? false,
    paymentTiming: (p as any).payment_timing ?? (p as any).paymentTiming ?? "immediate",
    price: Number((p as any).price || 0),
    duration: (p as any).duration || "",
    effort: (p as any).effort || "",
    audienceFor: (p as any).audienceFor || (p as any).audience_for || [],
    audienceNotFor: (p as any).audienceNotFor || (p as any).audience_not_for || [],
    instructorName: (p as any).instructorName || (p as any).instructor_name || "",
    instructorBio: (p as any).instructorBio || (p as any).instructor_bio || "",
    instructorPhoto: (p as any).instructorPhoto || (p as any).instructor_photo || "",
    instructors: (p as any).instructors || [],
    curriculum: (p as any).curriculum || [],
    includes: (p as any).includes || [],
    refundPolicy: (p as any).refundPolicy || (p as any).refund_policy || "",
    testimonials: (p as any).testimonials || [],
  }));
  const [program] = useState<Program | null>(all.find(p => p.id === id && p.status === "published") || null);
  const [otherPathways] = useState<Program[]>(all.filter(p => p.id !== id && p.status === "published").slice(0, 3));

  const curriculum = (program as any)?.curriculum || [];
  const audienceFor = (program as any)?.audienceFor || [];
  const audienceNotFor = (program as any)?.audienceNotFor || [];
  const includes = (program as any)?.includes || [];
  const instructorName = (program as any)?.instructorName || "";
  const instructorBio = (program as any)?.instructorBio || "";
  const instructorPhoto = (program as any)?.instructorPhoto || "";
  const instructors = ((program as any)?.instructors || []) as { name: string; bio: string; photo?: string; role?: string }[];
  const refundPolicy = (program as any)?.refundPolicy || "";
  const testimonials = (program as any)?.testimonials || [];
  const googleFormUrl = (program as any)?.google_form_url || (program as any)?.googleFormUrl || "";

  const handleSubmit = () => {
    if (googleFormUrl) {
      const url = /^https?:\/\//.test(googleFormUrl) ? googleFormUrl : `https://${googleFormUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  if (!program) {
    notFound();
  }

  const detailsList = program.details.split("|").map(s => s.trim()).filter(Boolean);

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ label: "Programs", href: "/programs" }, { label: program.title }]} />

          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-center">
            <div className="lg:col-span-7 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                  <div className={cn("p-2.5 rounded-lg hidden md:block", program.color)}>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {getIcon(program.icon as string, { size: 24 })}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Official BMAC Program
                  </span>
                </div>

                <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight mb-6">
                  {program.title}
                </h1>

                <p className="text-muted-foreground text-base md:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {program.desc}
                </p>

                <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 md:gap-10">
                  {(program as any).duration && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
                        <Clock size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Duration</p>
                        <p className="text-sm md:text-base font-bold text-secondary leading-tight">{(program as any).duration}</p>
                      </div>
                    </div>
                  )}
                  {(program as any).effort && (
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary shrink-0">
                        <Users size={20} className="md:w-6 md:h-6" />
                      </div>
                      <div className="text-left">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Effort</p>
                        <p className="text-sm md:text-base font-bold text-secondary leading-tight">{(program as any).effort}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 md:mt-10 lg:hidden">
                  <a href="#register" className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors">
                    {program.isPaid ? `Pay ₦${(program.price || 0).toLocaleString()} & Register` : "Apply to Program"}
                  </a>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5 relative aspect-[4/3] md:aspect-[3/2] rounded-xl border border-border overflow-hidden"
            >
              <Image src={program.img} alt={program.title} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 40vw" />
            </motion.div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ShareButtons title={program.title} />
      </div>

      {/* Main Content Area */}
      <section className="py-16 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">

          <div className="lg:col-span-7 space-y-16 md:space-y-20">
            {/* Overview */}
            <div>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Overview</h3>
              <p className="text-secondary/90 text-base md:text-lg leading-[1.7] md:leading-[1.8]">
                {program.longDesc}
              </p>
            </div>

            {/* Curriculum as progression */}
            {curriculum.length > 0 && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-2 md:mb-4 tracking-tight">What You&rsquo;ll Learn</h3>
                <p className="text-muted-foreground text-sm md:text-base mb-6 md:mb-8">Each module ends with a skill you can actually use.</p>
                <div className="space-y-3 md:space-y-4">
                  {curriculum.map((mod: { title: string; outcome: string }, i: number) => (
                    <div key={i} className="rounded-xl border border-border bg-card p-5 md:p-6 flex gap-4 md:gap-5">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-display font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-secondary text-sm md:text-base mb-1.5">{mod.title}</p>
                        <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex items-start gap-1.5">
                          <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                          {mod.outcome}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {program.skills?.length ? (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Skills You&rsquo;ll Build</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {program.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 md:p-5 rounded-xl bg-card border border-border">
                      <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                      <span className="text-sm font-bold text-secondary">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Audience fit */}
            {(audienceFor.length > 0 || audienceNotFor.length > 0) && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Who It&rsquo;s For</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {audienceFor.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-5">This program is for</h4>
                      <ul className="space-y-3.5">
                        {audienceFor.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                            <span className="text-sm text-secondary leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {audienceNotFor.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-5">This program is not for</h4>
                      <ul className="space-y-3.5">
                        {audienceNotFor.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <span className="w-4 h-4 rounded-md bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold leading-none">✕</span>
                            </span>
                            <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructors */}
            {instructors.length > 0 ? (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">
                  {instructors.length === 1 ? "Your Instructor" : "Your Instructors"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {instructors.map((inst, i) => (
                    <InstructorCard key={i} instructor={inst} color={program.color} index={i} />
                  ))}
                </div>
              </div>
            ) : instructorName ? (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Your Instructor</h3>
                <div className="rounded-xl border border-border bg-card p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  {instructorPhoto ? (
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-border shrink-0">
                      <Image src={instructorPhoto} alt={instructorName} fill className="object-cover" sizes="96px" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Users size={32} />
                    </div>
                  )}
                  <div>
                    <p className="font-display text-lg md:text-xl font-bold text-secondary">{instructorName}</p>
                    {instructorBio && (
                      <p className="text-sm text-muted-foreground leading-relaxed mt-3">{instructorBio}</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* What's included */}
            {includes.length > 0 && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">What&rsquo;s Included</h3>
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {includes.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-4 md:p-5 rounded-xl bg-card border border-border">
                      <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                      <span className="text-sm font-bold text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ */}
            {(program.faqs?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-8 tracking-tight">Common Questions</h3>
                <div className="space-y-3 md:space-y-4">
                  {program.faqs?.map((faq, i) => (
                    <div key={i} className="bg-card p-5 md:p-6 rounded-xl border border-border">
                      <p className="font-bold text-secondary text-sm md:text-base mb-2">{faq.q}</p>
                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Refund policy */}
            {refundPolicy && (
              <div className="rounded-xl border border-border bg-muted/30 p-6 md:p-8">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Refund policy</h4>
                <p className="text-sm text-secondary leading-relaxed">{refundPolicy}</p>
              </div>
            )}
          </div>

          <aside id="register" className="lg:col-span-5 scroll-mt-28">
            <div className="lg:sticky lg:top-32 space-y-6 md:space-y-8">

               {/* Logistics Widget */}
               <div className="bg-card border border-border rounded-xl p-6 md:p-8">
                  <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-6 md:mb-8">Workshop Logistics</h3>

                  <div className="space-y-5">
                    {(program as any).duration && (
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary flex-shrink-0">
                          <Clock size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Duration</p>
                          <p className="text-sm font-bold text-secondary leading-tight">{(program as any).duration}</p>
                        </div>
                      </div>
                    )}
                    {(program as any).effort && (
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary flex-shrink-0">
                          <Users size={18} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Effort</p>
                          <p className="text-sm font-bold text-secondary leading-tight">{(program as any).effort}</p>
                        </div>
                      </div>
                    )}
                    {detailsList.map((detail, i) => (
                      <div key={i} className="flex items-center gap-4 md:gap-5">
                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border flex items-center justify-center text-primary flex-shrink-0">
                          <MapPin size={18} />
                        </div>
                        <p className="text-xs font-bold text-secondary leading-tight">{detail}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* RSVP Form */}
               <div className="bg-card border border-border rounded-xl p-6 md:p-8 text-center md:text-left">
                     <h3 className="font-display text-xl md:text-2xl font-bold text-secondary mb-2">Secure Your Spot</h3>
                      <p className="text-muted-foreground text-xs md:text-sm mb-6 leading-relaxed">
                        Join the next cohort of ambassadors gathering in Jos.
                      </p>

               {!program.applicationsOpen ? (
                 <StatusBanner
                   title="Applications Closed"
                   description="This program is not currently accepting applications. Check back soon."
                   variant="closed"
                 />
               ) : googleFormUrl ? (
                 <button
                   onClick={handleSubmit}
                   className="w-full py-4 bg-primary text-card rounded-xl font-bold hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.98]"
                 >
                   Apply to Program
                   <ExternalLink size={16} />
                 </button>
               ) : (
                 <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
                   <p className="text-sm font-medium text-secondary mb-1">Applications opening soon</p>
                   <p className="text-xs text-muted-foreground">Check back later or contact us for more information.</p>
                 </div>
               )}
                  </div>
             </div>
           </aside>
        </div>
      </section>

      {/* Program Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary mb-6 md:mb-12 tracking-tight">Alumni Voices</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t: { name: string; designation: string; quote: string }, i: number) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <blockquote className="rounded-xl border border-border bg-card p-6 h-full">
                    <div className="flex items-center gap-1 text-primary mb-4">
                      <Sparkles size={14} />
                      <Sparkles size={14} />
                      <Sparkles size={14} />
                      <Sparkles size={14} />
                      <Sparkles size={14} />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                    <footer className="text-xs">
                      <p className="font-bold text-secondary">{t.name}</p>
                      <p className="text-muted-foreground mt-0.5">{t.designation}</p>
                    </footer>
                  </blockquote>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other Growth Pathways */}
      {otherPathways.length > 0 && (
        <section className="py-16 md:py-24 px-4 md:px-6 border-t border-border/50">
          <div className="max-w-7xl mx-auto text-center">
              <h2 className="font-display text-2xl md:text-3xl font-extrabold text-secondary tracking-tight mb-12">Other Growth Pathways</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {otherPathways.map((item, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                      <Link href={`/programs/${item.id}`} className="group block h-full">
                        <BentoCard className="bg-card border border-border rounded-xl p-8 h-full flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-lg ${item.color} flex items-center justify-center mb-6 shrink-0 mx-auto`}>
                              {getIcon(item.icon as string, { size: 24 })}
                            </div>
                            <h3 className="font-display text-lg font-bold text-secondary group-hover:text-primary transition-colors leading-tight mb-3 text-center">
                              {item.title}
                           </h3>
                            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed line-clamp-2 text-center">
                              {item.desc}
                            </p>
                        </BentoCard>
                      </Link>
                  </FadeIn>
                ))}
              </div>
          </div>
        </section>
      )}
    </main>
  );
}
