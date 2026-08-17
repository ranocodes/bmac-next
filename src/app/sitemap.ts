import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || "https://bmac-next.vercel.app"
).replace(/\/+$/, "");

export const dynamic = "force-dynamic";

const staticRoutes = [
  { path: "/", priority: 1.0, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/programs", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/events", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/gallery", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/news", priority: 0.7, changeFrequency: "weekly" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/get-involved", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/donor-lookup", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/application-status", priority: 0.5, changeFrequency: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, programs, news] = await Promise.all([
    db.query<{ id: string; updated_at: string | null; created_at: string; status: string }>(
      'SELECT id, updated_at, created_at, status FROM public.events'
    ),
    db.query<{ id: string; updated_at: string | null; created_at: string }>(
      'SELECT id, updated_at, created_at FROM public.programs'
    ),
    db.query<{ id: string; updated_at: string | null; created_at: string; status: string }>(
      'SELECT id, updated_at, created_at, status FROM public.news_articles'
    ),
  ]);

  const publishedEvents = events.filter((e) => e.status === "published");
  const publishedNews = news.filter((n) => n.status === "published");

  return [
    ...staticRoutes.map((r) => ({
      url: `${baseUrl}${r.path}`,
      lastModified: new Date(),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...publishedEvents.map((e) => ({
      url: `${baseUrl}/events/${e.id}`,
      lastModified: new Date(e.updated_at || e.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...programs.map((p) => ({
      url: `${baseUrl}/programs/${p.id}`,
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publishedNews.map((n) => ({
      url: `${baseUrl}/news/${n.id}`,
      lastModified: new Date(n.updated_at || n.created_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
