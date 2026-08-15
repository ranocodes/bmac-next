"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Bookmark, Send, CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ShareButtons from "@/components/ui/ShareButtons";
import ReactMarkdown from "react-markdown";
import { subscribeToNewsletter } from "@/actions/newsletter";
import type { NewsArticle, EventPass } from "@/types/cms";

function formatEventDate(raw: string | undefined): { month: string; day: string } {
  if (!raw) return { month: "", day: "" };
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const d = new Date(raw + "T00:00:00");
    if (isNaN(d.getTime())) return { month: "", day: "" };
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      day: String(d.getDate()),
    };
  }
  const parts = raw.split(" ");
  return {
    month: parts[0]?.substring(0, 3) || "",
    day: (parts[1] || "").replace(",", ""),
  };
}

interface NewsDetailClientProps {
  id: string;
  initialNews: any[];
  initialEvents: any[];
}

function normalizeNews(raw: any[]): NewsArticle[] {
  return raw.map(a => ({
    ...a,
    img: (a as any).img_url || a.img || "/images/placeholder.jpg",
    desc: a.desc || (a as any).description || "",
  }));
}

function normalizeEvents(raw: any[]): EventPass[] {
  return raw.map(e => ({
    ...e,
    date: (e as any).event_date || e.date || "",
    desc: e.desc || (e as any).description || "",
    features: (e as any).features || [],
  }));
}

export default function NewsDetailClient({ id, initialNews, initialEvents }: NewsDetailClientProps) {
  const allNews = normalizeNews(initialNews);
  const found = allNews.find(a => a.id === id) || null;
  const [article] = useState<NewsArticle | null>(found);
  const [relatedStories] = useState<NewsArticle[]>(
    found
      ? allNews.filter(a => a.id !== id && a.category === found.category).slice(0, 3)
      : []
  );
  const [events] = useState<EventPass[]>(normalizeEvents(initialEvents).slice(0, 3));
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterError, setNewsletterError] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [bookmarked, setBookmarked] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = JSON.parse(localStorage.getItem("bmac-bookmarks") || "[]");
      return Array.isArray(saved) && saved.includes(id);
    } catch {
      return false;
    }
  });

  const toggleBookmark = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem("bmac-bookmarks") || "[]");
      const next = bookmarked
        ? saved.filter(s => s !== id)
        : Array.from(new Set([...saved, id]));
      localStorage.setItem("bmac-bookmarks", JSON.stringify(next));
      setBookmarked(!bookmarked);
    } catch {
      setBookmarked(!bookmarked);
    }
  };

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterLoading) return;
    setNewsletterLoading(true);
    setNewsletterError("");
    const res = await subscribeToNewsletter(newsletterEmail);
    setNewsletterLoading(false);
    if (res.error) {
      setNewsletterError(res.error);
      return;
    }
    setNewsletterSubmitted(true);
  };

  if (!article) {
    return (
      <main className="bg-background min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="font-display text-3xl font-bold text-secondary mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-8">This article may have been removed or the link is invalid.</p>
          <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Back to Chronicle
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main suppressHydrationWarning className="bg-background">
      {/* Editorial Header */}
      <section className="pt-24 md:pt-32 pb-10 md:pb-14 px-6 bg-background">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Breadcrumbs items={[{ label: "News", href: "/news" }, { label: article.title }]} />
          </div>

          <span className="inline-flex items-center rounded-lg bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            {article.category}
          </span>

          <h1 className="font-display text-3xl md:text-5xl font-bold text-secondary tracking-tight leading-tight mt-6 mb-5">
            {article.title}
          </h1>

          <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            {article.desc}
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-6">
            <Calendar size={14} /> {article.date}
          </div>
        </div>
      </section>

      {/* Lead Image */}
      <section className="px-4 md:px-6 pb-14 md:pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="relative aspect-[16/9] rounded-xl border border-border overflow-hidden">
            <Image
              src={article.img}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Article Body */}
      <section className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-2xl mx-auto">
          <article className="prose prose-slate prose-lg max-w-none text-secondary/90">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* Engagement Footer */}
          <div className="mt-12 md:mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Share story</span>
              <div className="flex items-center gap-2">
                <ShareButtons title={article.title} />
                <button onClick={toggleBookmark} aria-label={bookmarked ? "Remove bookmark" : "Save story"} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${bookmarked ? "bg-primary text-card" : "bg-background border border-border text-muted-foreground hover:border-primary/40"}`}><Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} /></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Widgets */}
      <section className="px-4 md:px-6 pb-16 md:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-lg font-bold text-secondary">Upcoming Calendar</h2>
              <Link href="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:gap-2.5 transition-all">
                View all <ArrowRight size={13} />
              </Link>
            </div>

            {events.length > 0 ? (
              <div className="space-y-5">
                {events.map((event, i) => (
                  <Link href={`/events/${event.id}`} key={i} className="group flex gap-4 items-start">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background border border-border flex flex-col items-center justify-center group-hover:border-primary transition-colors">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{formatEventDate(event.date).month}</span>
                      <span className="text-sm font-extrabold text-secondary">{formatEventDate(event.date).day}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-secondary group-hover:text-primary transition-colors leading-tight mb-1">{event.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{event.venue}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-border rounded-lg">
                <Calendar className="mx-auto mb-3 text-muted-foreground/30" size={24} />
                <p className="text-xs font-bold text-muted-foreground/40 uppercase tracking-widest">Clear Calendar</p>
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="bg-card border border-border rounded-xl p-6 flex flex-col">
            <h2 className="font-display text-lg font-bold text-secondary mb-2">Stay Notified.</h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Get the latest stories from Jos delivered every Friday.
            </p>

            {newsletterSubmitted ? (
              <div className="text-center py-6 mt-auto">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={24} className="text-primary" />
                </div>
                <p className="font-bold text-secondary mb-1">You're In!</p>
                <p className="text-xs text-muted-foreground">Check your inbox every Friday.</p>
              </div>
            ) : (
              <form className="space-y-3 mt-auto" onSubmit={handleNewsletter}>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                  required
                />
                {newsletterError && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs font-bold text-red-600">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{newsletterError}</span>
                  </div>
                )}
                <button type="submit" disabled={newsletterLoading} className="w-full py-3.5 bg-primary text-card rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
                  {newsletterLoading ? <><Loader2 size={16} className="animate-spin" /> Subscribing...</> : <>Get Friday Updates <Send size={15} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* More Stories */}
      {relatedStories.length > 0 && (
        <section className="py-16 md:py-20 px-4 md:px-6 bg-muted/50 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-secondary tracking-tight mb-10">More from the Chronicle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {relatedStories.map((item, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <Link href={`/news/${item.id}`} className="group block">
                    <div className="relative aspect-video rounded-xl border border-border overflow-hidden mb-5">
                      <Image src={item.img} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                    </div>
                    <div className="flex items-center gap-3 mb-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      <span className="text-primary">{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-secondary group-hover:text-primary transition-colors leading-tight line-clamp-2">
                      {item.title}
                    </h3>
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
