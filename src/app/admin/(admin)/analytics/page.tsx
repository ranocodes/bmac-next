import { requirePage } from "@/lib/auth/server";
import { getOperationalAnalytics } from "@/actions/analytics";
import AnalyticsClient from "@/components/admin/AnalyticsClient";

export default async function AnalyticsPage() {
  await requirePage("view_analytics");
  const data = await getOperationalAnalytics();
  return <AnalyticsClient initialData={data} />;
}
