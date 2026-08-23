import { getDashboardStats } from "@/actions/analytics";
import DashboardClient from "@/components/admin/DashboardClient";

const EMPTY_STATS = {
  counts: { totalMembers: 0, activePrograms: 0, revenueThisMonth: 0, eventsThisMonth: 0 },
  recentNews: [] as unknown[],
  recentEvents: [] as unknown[],
  revenueByMonth: [] as { month: string; value: number }[],
};

export default async function AdminDashboard() {
  let stats: {
    counts: { totalMembers: number; activePrograms: number; revenueThisMonth: number; eventsThisMonth: number };
    recentNews: unknown[];
    recentEvents: unknown[];
    revenueByMonth: { month: string; value: number }[];
  } = EMPTY_STATS;
  try {
    stats = await getDashboardStats();
  } catch (err) {
    console.error("dashboard stats error:", err);
  }

  return (
    <DashboardClient
      initialCounts={stats.counts}
      recentNews={stats.recentNews}
      recentEvents={stats.recentEvents}
      revenueByMonth={stats.revenueByMonth}
    />
  );
}
