"use server";

import { db } from "@/lib/db";
import { countOpenWorkflows } from "@/lib/workflows";

export async function getDashboardStats() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    totalMembers,
    activePrograms,
    pendingApps,
    revenueThisMonth,
    openInquiries,
    eventsThisMonth,
    news, events,
    logs,
    revenueByMonth,
    memberGrowth,
  ] = await Promise.all([
    db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.people
       WHERE roles @> '["member"]'::jsonb OR roles @> '["volunteer"]'::jsonb`
    ).catch(() => [{ count: "0" }]),
    db.count("programs").catch(() => 0),
    countOpenWorkflows(),
    db.query<{ total: string }>(
      `SELECT COALESCE(SUM((pr.meta->>'amount')::numeric), 0)::text AS total
       FROM public.person_records pr
       WHERE pr.kind = 'donation' AND pr.status = 'completed'
         AND pr.created_at >= $1`,
      [startOfMonth]
    ).catch(() => [{ total: "0" }]),
    db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.workflow_records WHERE status = 'open'`
    ).catch(() => [{ count: "0" }]),
    db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.events
       WHERE status = 'published' AND date >= $1`,
      [startOfMonth]
    ).catch(() => [{ count: "0" }]),
    db.getAll<any>("news_articles", { orderBy: "created_at", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.getAll<any>("events", { orderBy: "date", orderDir: "DESC", limit: 4 }).catch(() => []),
    db.query<any>("SELECT * FROM public.activity_logs ORDER BY timestamp DESC LIMIT 15").catch(() => []),
    db.query<{ month: string; total: string }>(
      `SELECT TO_CHAR(pr.created_at, 'YYYY-MM') AS month,
              COALESCE(SUM((pr.meta->>'amount')::numeric), 0)::text AS total
       FROM public.person_records pr
       WHERE pr.kind = 'donation' AND pr.status = 'completed'
         AND pr.created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month ORDER BY month ASC`
    ).catch(() => []),
    db.query<{ month: string; count: string }>(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*)::text AS count
       FROM public.people
       WHERE created_at >= NOW() - INTERVAL '6 months'
       GROUP BY month ORDER BY month ASC`
    ).catch(() => []),
  ]);

  const revenueMonths = revenueByMonth.map((r: any) => ({ month: r.month, value: Number(r.total) }));
  const memberMonths = memberGrowth.map((r: any) => ({ month: r.month, value: Number(r.count) }));

  return {
    counts: {
      totalMembers: Number(totalMembers[0]?.count ?? 0),
      activePrograms: activePrograms,
      pendingApps: pendingApps,
      revenueThisMonth: Number(revenueThisMonth[0]?.total ?? 0),
      openInquiries: Number(openInquiries[0]?.count ?? 0),
      eventsThisMonth: Number(eventsThisMonth[0]?.count ?? 0),
    },
    recentNews: news,
    recentEvents: events.slice().sort((a: any, b: any) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime()),
    recentActivity: logs,
    todayCount: logs.filter((l: any) => new Date(l.created_at || l.timestamp).getTime() > Date.now() - 86400000).length,
    revenueByMonth: revenueMonths,
    memberGrowth: memberMonths,
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

export async function getDailyViewsSeries(rangeDays = 30) {
  const rows = await db.query<{ view_date: string; views: string; visitors: string }>(
    `SELECT view_date, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors
     FROM public.page_views
     WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
     GROUP BY view_date ORDER BY view_date ASC`,
    [rangeDays]
  ).catch(() => []);
  return rows.map(r => ({ date: r.view_date, views: Number(r.views), visitors: Number(r.visitors) }));
}

export async function getTrafficOverview(rangeDays = 30) {
  const [totalRow, uniqueRow, todayRow, avgRow] = await Promise.all([
    db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.page_views
       WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')`,
      [rangeDays]
    ).catch(() => [{ count: "0" }]),
    db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id) AS count FROM public.page_views
       WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')`,
      [rangeDays]
    ).catch(() => [{ count: "0" }]),
    db.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM public.page_views WHERE view_date = CURRENT_DATE"
    ).catch(() => [{ count: "0" }]),
    db.query<{ count: string }>(
      `SELECT COUNT(DISTINCT view_date) AS count FROM public.page_views
       WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')`,
      [rangeDays]
    ).catch(() => [{ count: "1" }]),
  ]);
  const totalViews = Number(totalRow[0]?.count ?? 0);
  const days = Number(avgRow[0]?.count ?? 1);
  return {
    totalViews,
    uniqueVisitors: Number(uniqueRow[0]?.count ?? 0),
    todayViews: Number(todayRow[0]?.count ?? 0),
    avgDailyViews: days ? Math.round(totalViews / days) : 0,
  };
}

export async function getTopPages(rangeDays = 30, limit = 10) {
  const rows = await db.query<{ path: string; count: string }>(
    `SELECT path, COUNT(*) AS count FROM public.page_views
     WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
     GROUP BY path ORDER BY count DESC LIMIT $2`,
    [rangeDays, limit]
  ).catch(() => []);
  return rows.map(r => ({ path: r.path, views: Number(r.count) }));
}

export async function getReferrers(rangeDays = 30, limit = 10) {
  const rows = await db.query<{ referrer: string; count: string }>(
    `SELECT referrer, COUNT(*) AS count FROM public.page_views
     WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')
     GROUP BY referrer ORDER BY count DESC LIMIT $2`,
    [rangeDays, limit]
  ).catch(() => []);
  const hosts = new Map<string, number>();
  for (const r of rows) {
    const host = referrerHost(r.referrer);
    hosts.set(host, (hosts.get(host) || 0) + Number(r.count));
  }
  return [...hosts.entries()]
    .map(([host, views]) => ({ host, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

export async function getDeviceBreakdown(rangeDays = 30) {
  const rows = await db.query<{ type: string; count: string }>(
    `SELECT device_type AS type, COUNT(*) AS count FROM public.page_views
     WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day') AND device_type != ''
     GROUP BY device_type ORDER BY count DESC`,
    [rangeDays]
  ).catch(() => []);
  return rows.map(r => ({ type: r.type || "unknown", count: Number(r.count) }));
}

export async function getConversionFunnels(rangeDays = 30) {
  const [events, totalRow] = await Promise.all([
    db.query<{ name: string; count: string }>(
      `SELECT name, COUNT(*) AS count FROM public.analytics_events
       WHERE created_at >= now() - ($1::int * INTERVAL '1 day')
       GROUP BY name ORDER BY count DESC`,
      [rangeDays]
    ).catch(() => []),
    db.query<{ count: string }>(
      `SELECT COUNT(*) AS count FROM public.page_views
       WHERE view_date >= CURRENT_DATE - ($1::int * INTERVAL '1 day')`,
      [rangeDays]
    ).catch(() => [{ count: "0" }]),
  ]);

  const eventCounts = events.map(e => ({ name: e.name, count: Number(e.count) }));
  const countFor = (name: string) => Number(events.find(e => e.name === name)?.count ?? 0);
  const pageViews = Number(totalRow[0]?.count ?? 0);

  const funnel = [
    { step: "page_view", count: pageViews, rate: 100 },
    { step: "event_registered", count: countFor("event_registered"), rate: 0 },
    { step: "donation_completed", count: countFor("donation_completed"), rate: 0 },
  ];
  for (const s of funnel) s.rate = pageViews ? Math.round((s.count / pageViews) * 1000) / 10 : 0;

  return { eventCounts, funnel };
}

function referrerHost(referrer: string): string {
  if (!referrer) return "(direct)";
  try {
    return new URL(referrer).hostname || "(direct)";
  } catch {
    return referrer;
  }
}

export async function getActivityBreakdown() {
  const rows = await db.query<{ action: string; count: string }>(
    "SELECT action, COUNT(*) AS count FROM public.activity_logs GROUP BY action ORDER BY count DESC"
  ).catch(() => []);
  return rows.map(r => ({ action: r.action.replace(/_/g, " "), count: Number(r.count) }));
}

export async function getOperationalAnalytics() {
  const [
    ticketStats,
    revenueRow,
    donationRow,
    donationStats,
    programStats,
    workflowStats,
  ] = await Promise.all([
    db.query<{ status: string; count: string }>(
      "SELECT status, COUNT(*) AS count FROM public.event_tickets GROUP BY status"
    ).catch(() => []),
    db.query<{ total: string }>(
      `SELECT COALESCE(SUM(t.amount * t.quantity), 0)::text AS total
       FROM public.event_tickets t WHERE t.status = 'confirmed'`
    ).catch(() => [{ total: "0" }]),
    db.query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM((pr.meta->>'amount')::numeric), 0)::text AS total, COUNT(*)::text AS count
       FROM public.person_records pr WHERE pr.kind = 'donation' AND pr.status = 'completed'`
    ).catch(() => [{ total: "0", count: "0" }]),
    db.query<{ status: string; count: string }>(
      "SELECT status, COUNT(*) AS count FROM public.person_records WHERE kind = 'donation' GROUP BY status"
    ).catch(() => []),
    db.query<{ count: string }>(
      "SELECT COUNT(*) AS count FROM public.program_applications"
    ).catch(() => [{ count: "0" }]),
    db.query<{ kind: string; count: string }>(
      "SELECT kind, COUNT(*) AS count FROM public.workflow_records GROUP BY kind"
    ).catch(() => []),
  ]);

  const checkedIn = await db.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM public.event_tickets WHERE status = 'confirmed' AND checked_in = true"
  ).catch(() => [{ count: "0" }]);

  const participants = await db.query<{ count: string }>(
    "SELECT COUNT(*) AS count FROM public.participants"
  ).catch(() => [{ count: "0" }]);

  const applicationsByStatus = await db.query<{ status: string; count: string }>(
    "SELECT status, COUNT(*) AS count FROM public.program_applications GROUP BY status"
  ).catch(() => []);

  const ticketMap = Object.fromEntries(ticketStats.map(r => [r.status, Number(r.count)]));
  const confirmed = ticketMap.confirmed || 0;

  return {
    tickets: {
      byStatus: ticketMap,
      confirmed,
      pending: ticketMap.pending || 0,
      cancelled: ticketMap.cancelled || 0,
      checkedIn: Number(checkedIn[0]?.count ?? 0),
      attendanceRate: confirmed ? Math.round((Number(checkedIn[0]?.count ?? 0) / confirmed) * 100) : 0,
    },
    revenue: {
      events: Number(revenueRow[0]?.total ?? 0),
      donations: Number(donationRow[0]?.total ?? 0),
    },
    donations: {
      total: Number(donationRow[0]?.total ?? 0),
      count: Number(donationRow[0]?.count ?? 0),
      byStatus: Object.fromEntries(donationStats.map(r => [r.status, Number(r.count)])),
    },
    programs: {
      applications: Number(programStats[0]?.count ?? 0),
      participants: Number(participants[0]?.count ?? 0),
      applicationsByStatus: Object.fromEntries(applicationsByStatus.map(r => [r.status, Number(r.count)])),
    },
    workflows: Object.fromEntries(workflowStats.map(r => [r.kind, Number(r.count)])),
  };
}
