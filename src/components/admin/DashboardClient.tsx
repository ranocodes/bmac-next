"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Calendar, BookOpen, Image, Users, Star, TrendingUp, ArrowRight, Plus, Sparkle } from "lucide-react";
import { getAll, seedIfEmpty, create } from "@/data/store";
import { mockNews, mockEvents, mockPrograms, mockGallery, mockTeam, mockTestimonials, mockStats } from "@/data/mock-data";
import type { NewsArticle, EventPass, Program, GalleryItem, TeamMember, Testimonial, Category } from "@/types/cms";

const quickActions = [
  { label: "New Article", href: "/admin/news/new", icon: Newspaper, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "New Event", href: "/admin/events/new", icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "New Program", href: "/admin/programs/new", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Upload Photo", href: "/admin/gallery/new", icon: Image, color: "text-purple-500", bg: "bg-purple-50" },
];

const hours = new Date().getHours();
const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

export default function DashboardClient() {
  const [counts, setCounts] = useState({ news: 0, events: 0, programs: 0, gallery: 0, team: 0, testimonials: 0 });
  const [recentNews, setRecentNews] = useState<NewsArticle[]>([]);
  const [recentEvents, setRecentEvents] = useState<EventPass[]>([]);

  useEffect(() => {
    seedIfEmpty("news", mockNews.map(n => ({ ...n, desc: n.description, img: n.img_url })));
    seedIfEmpty("events", mockEvents.map(e => ({ ...e, date: e.event_date, desc: e.description, isPaid: e.is_paid })));
    seedIfEmpty("programs", mockPrograms);
    seedIfEmpty("gallery", mockGallery);
    seedIfEmpty("team", mockTeam);
    seedIfEmpty("testimonials", mockTestimonials);
    seedIfEmpty("stats", mockStats);
    seedIfEmpty("categories", [
      "Achievements", "Programs", "Alumni", "Partnerships",
      "Events", "Announcements", "Workshops", "Competition",
      "Culture", "Mentorship", "Community",
    ].map((name, i) => ({ id: `cat-${i}`, name })));

    const news = getAll<NewsArticle>("news");
    const events = getAll<any>("events").map(e => ({ ...e, date: e.date || e.event_date || "", desc: e.desc || e.description || "" }));
    setCounts({
      news: news.length,
      events: events.length,
      programs: getAll<Program>("programs").length,
      gallery: getAll<GalleryItem>("gallery").length,
      team: getAll<TeamMember>("team").length,
      testimonials: getAll<Testimonial>("testimonials").length,
    });
    setRecentNews([...news].reverse().slice(0, 4));
    setRecentEvents(events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4));
  }, []);

  const statCards = [
    { label: "News", value: counts.news, icon: Newspaper, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Events", value: counts.events, icon: Calendar, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Programs", value: counts.programs, icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Gallery", value: counts.gallery, icon: Image, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Team", value: counts.team, icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Testimonials", value: counts.testimonials, icon: Star, color: "text-cyan-500", bg: "bg-cyan-50" },
  ];

  return (
    <div className="space-y-8 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-secondary">
          {greeting}, Admin
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">Here is what is happening across your site.</p>
      </div>

      {/* Stat cards — bento row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-card rounded-2xl border border-border/50 p-5 transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold font-display tracking-tight text-secondary">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions — horizontal scroll on mobile, grid on desktop */}
      <div className="bg-card rounded-3xl border border-border/50 p-5 md:p-6">
        <div className="flex items-center gap-2 mb-5">
          <Sparkle size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-secondary">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3.5 h-auto lg:h-12 pt-4 pb-3.5 lg:py-0 px-4 md:px-5 lg:px-5 rounded-2xl bg-muted/50 hover:bg-muted border border-border/30 transition-all active:scale-[0.97] text-center lg:text-left"
            >
              <div className={`md:w-11 md:h-11 lg:w-9 lg:h-9 rounded-xl ${a.bg} flex items-center justify-center flex-shrink-0`}>
                <a.icon size={18} className={`${a.color} md:scale-125 lg:scale-100`} />
              </div>
              <span className="text-sm md:text-base lg:text-sm font-medium text-secondary">{a.label}</span>
              <ArrowRight size={15} className="hidden lg:block ml-auto text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent content — asymmetric bento grid */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Recent News — takes 3/5 on desktop */}
        <div className="xl:col-span-3 bg-card rounded-3xl border border-border/50 p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Newspaper size={16} className="text-blue-500" />
              <h2 className="text-sm font-semibold text-secondary">Recent News</h2>
            </div>
            <Link href="/admin/news" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Newspaper size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No articles yet</p>
              <Link href="/admin/news/new" className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first article</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentNews.map(a => (
                <Link key={a.id} href={`/admin/news/${a.id}/edit`} className="flex items-center gap-4 py-3 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                    <Newspaper size={15} className="text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.date} &middot; {a.category}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/news/new" className="mt-5 flex items-center justify-center gap-2 h-11 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={15} /> Add article
          </Link>
        </div>

        {/* Upcoming Events — takes 2/5 on desktop */}
        <div className="xl:col-span-2 bg-card rounded-3xl border border-border/50 p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-amber-500" />
              <h2 className="text-sm font-semibold text-secondary">Upcoming Events</h2>
            </div>
            <Link href="/admin/events" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">View all</Link>
          </div>
          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar size={32} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No events yet</p>
              <Link href="/admin/events/new" className="mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors">Create your first event</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentEvents.map(e => (
                <Link key={e.id} href={`/admin/events/${e.id}/edit`} className="flex items-center gap-4 py-3 border-b border-border/20 last:border-0 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-amber-50 transition-colors">
                    <Calendar size={15} className="text-muted-foreground group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate group-hover:text-primary transition-colors">{e.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{e.date} &middot; {e.venue}</p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/0 group-hover:text-muted-foreground transition-all flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
          <Link href="/admin/events/new" className="mt-5 flex items-center justify-center gap-2 h-11 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-secondary hover:border-border hover:bg-muted/50 transition-all">
            <Plus size={15} /> Add event
          </Link>
        </div>
      </div>
    </div>
  );
}
