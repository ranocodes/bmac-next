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
import dynamic from "next/dynamic";

const AnalyticsClient = dynamic(() => import("@/components/admin/AnalyticsClient"), { ssr: false });

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
