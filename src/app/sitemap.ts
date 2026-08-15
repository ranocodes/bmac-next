import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export const dynamic = "force-dynamic";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/programs", priority: 0.9 },
  { path: "/events", priority: 0.9 },
  { path: "/gallery", priority: 0.6 },
  { path: "/news", priority: 0.7 },
  { path: "/contact", priority: 0.7 },
  { path: "/get-involved", priority: 0.8 },
  { path: "/privacy", priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, programs, news] = await Promise.all([
    db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC" }),
  ]);

  const publishedEvents = (events || []).filter((e: any) => e.status === "published");
  const publishedNews = (news || []).filter((n: any) => n.status === "published");

  return [
    ...staticRoutes.map((r) => ({
      url: `${baseUrl}${r.path}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: r.priority,
    })),
    ...publishedEvents.map((e: any) => ({
      url: `${baseUrl}/events/${e.id}`,
      lastModified: e.updated_at ? new Date(e.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...(programs || []).map((p: any) => ({
      url: `${baseUrl}/programs/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...publishedNews.map((n: any) => ({
      url: `${baseUrl}/news/${n.id}`,
      lastModified: n.updated_at ? new Date(n.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
