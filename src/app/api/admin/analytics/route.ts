import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import {
  getOperationalAnalytics,
  getTrafficOverview,
  getDailyViewsSeries,
  getTopPages,
  getReferrers,
  getDeviceBreakdown,
  getConversionFunnels,
} from "@/actions/analytics";

export async function GET() {
  try {
    await requirePermission("view_analytics");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
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
  return NextResponse.json({
    operational,
    traffic: { overview, dailyViews, topPages, referrers, devices },
    conversions,
  });
}
