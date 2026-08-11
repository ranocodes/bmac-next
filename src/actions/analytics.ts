"use server";

import { db } from "@/lib/db";
import { countOpenWorkflows } from "@/lib/workflows";

export async function getDashboardStats() {
  const today = Date.now() - 86400000 * 1000;

  const [
    newsCount, eventsCount, programsCount, galleryCount,
    teamCount, testimonialsCount, workflowOpenCount,
    news, events, gallery, team, testimonials,
    logs,
  ] = await Promise.all([
    db.count("news_articles").catch(() => 0),
    db.count("events").catch(() => 0),
    db.count("programs").catch(() => 0),
    db.count("gallery_items").catch(() => 0),
    db.count("team_members").catch(() => 0),
    db.count("testimonials").catch(() => 0),
    countOpenWorkflows(),
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.getAll<any>("events", { orderBy: "date", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.getAll<any>("gallery_items", { orderBy: "created_at", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.getAll<any>("team_members", { orderBy: "created_at", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.query<any>("SELECT * FROM public.activity_logs ORDER BY timestamp DESC LIMIT 15").catch(() => []),
  ]);

  return {
    counts: {
      news: newsCount,
      events: eventsCount,
      programs: programsCount,
      gallery: galleryCount,
      team: teamCount,
      testimonials: testimonialsCount,
      workflowOpen: workflowOpenCount,
    },
    recentNews: news,
    recentEvents: events.slice().sort((a: any, b: any) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()),
    recentActivity: logs,
    todayCount: logs.filter((l: any) => new Date(l.created_at || l.timestamp).getTime() > Date.now() - 86400000).length,
  };
}

export async function getTableCounts() {
  const tables = ["news_articles", "events", "programs", "gallery_items", "team_members", "testimonials"];
  const results = await Promise.all(tables.map(t => db.count(t).catch(() => 0)));
  const counts = Object.fromEntries(tables.map((t, i) => [t, results[i]]));
  counts.workflowOpen = await countOpenWorkflows();
  return counts;
}

export async function getActivitySummary() {
  const [topUsers, topActions] = await Promise.all([
    db.query<{ user: string; count: string }>(
      `SELECT "user", COUNT(*) AS count FROM public.activity_logs GROUP BY "user" ORDER BY count DESC LIMIT 5`
    ).catch(() => []),
    db.query<{ action: string; count: string }>(
      "SELECT action, COUNT(*) AS count FROM public.activity_logs GROUP BY action ORDER BY count DESC LIMIT 5"
    ).catch(() => []),
  ]);

  return {
    topUsers: topUsers.map(u => ({ name: u.user, count: Number(u.count) })),
    topActions: topActions.map(a => ({ action: a.action, count: Number(a.count) })),
  };
}

export async function getVisitorStats() {
  const [totalViews, uniqueVisitors, topPages, recentViews] = await Promise.all([
    db.query<{ count: string }>("SELECT COUNT(*) AS count FROM public.page_views").catch(() => [{ count: "0" }]),
    db.query<{ count: string }>("SELECT COUNT(DISTINCT session_id) AS count FROM public.page_views").catch(() => [{ count: "0" }]),
    db.query<{ path: string; count: string }>("SELECT path, COUNT(*) AS count FROM public.page_views GROUP BY path ORDER BY count DESC LIMIT 5").catch(() => []),
    db.query<{ count: string }>("SELECT COUNT(*) AS count FROM public.page_views WHERE view_date = CURRENT_DATE").catch(() => [{ count: "0" }]),
  ]);

  return {
    totalViews: Number(totalViews[0]?.count ?? 0),
    uniqueVisitors: Number(uniqueVisitors[0]?.count ?? 0),
    todayViews: Number(recentViews[0]?.count ?? 0),
    topPages: topPages.map(p => ({ path: p.path, count: Number(p.count) })),
  };
}

export async function getDailyViews() {
  const rows = await db.query<{ view_date: string; count: string }>(
    `SELECT view_date, COUNT(*) AS count FROM public.page_views 
     WHERE view_date >= CURRENT_DATE - INTERVAL '30 days' 
     GROUP BY view_date ORDER BY view_date ASC`
  ).catch(() => []);
  return rows.map(r => ({ date: r.view_date, count: Number(r.count) }));
}

export async function getActivityBreakdown() {
  const rows = await db.query<{ action: string; count: string }>(
    "SELECT action, COUNT(*) AS count FROM public.activity_logs GROUP BY action ORDER BY count DESC"
  ).catch(() => []);
  return rows.map(r => ({ action: r.action.replace(/_/g, " "), count: Number(r.count) }));
}
