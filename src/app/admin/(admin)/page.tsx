import { getDashboardStats } from "@/actions/analytics";
import DashboardClient from "@/components/admin/DashboardClient";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <DashboardClient
      initialCounts={stats.counts}
      recentNews={stats.recentNews}
      recentEvents={stats.recentEvents}
      recentActivity={stats.recentActivity}
      todayCount={stats.todayCount}
    />
  );
}
