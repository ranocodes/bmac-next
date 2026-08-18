import { requirePage } from "@/lib/auth/server";
import {
  getOperationalAnalytics,
  getTrafficOverview,
  getDailyViewsSeries,
  getTopPages,
  getReferrers,
  getDeviceBreakdown,
  getConversionFunnels,
} from "@/actions/analytics";
import AnalyticsClient from "@/components/admin/AnalyticsClient";

export default async function AnalyticsPage() {
  await requirePage("view_analytics");
  const [operational, overview, dailyViews, topPages, referrers, devices, conversions] =
    await Promise.all([
      getOperationalAnalytics(),
      getTrafficOverview(),
      getDailyViewsSeries(),
      getTopPages(),
      getReferrers(),
      getDeviceBreakdown(),
      getConversionFunnels(),
    ]);
  return (
    <AnalyticsClient
      initialData={{
        operational,
        traffic: { overview, dailyViews, topPages, referrers, devices },
        conversions,
      }}
    />
  );
}
