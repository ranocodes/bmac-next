import { db } from "@/lib/db";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function AdminDashboard() {
  const [news, events, programs, gallery, team, testimonials, logs] = await Promise.all([
    db.getAll<any>("news_articles").catch(() => []),
    db.getAll<any>("events").catch(() => []),
    db.getAll<any>("programs").catch(() => []),
    db.getAll<any>("gallery_items").catch(() => []),
    db.getAll<any>("team_members").catch(() => []),
    db.getAll<any>("testimonials").catch(() => []),
    db.getAll<any>("activity_logs").catch(() => []),
  ]);

  const today = Date.now() - 86400000;

  return (
    <DashboardClient
      initialCounts={{
        news: news.length,
        events: events.length,
        programs: programs.length,
        gallery: gallery.length,
        team: team.length,
        testimonials: testimonials.length,
      }}
      recentNews={[...news].reverse().slice(0, 4)}
      recentEvents={events
        .slice()
        .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
        .slice(0, 4)}
      recentActivity={logs.slice(0, 15)}
      todayCount={logs.filter((l: any) => l.timestamp > today).length}
    />
  );
}
