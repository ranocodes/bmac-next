import { getTableCounts, getActivitySummary, getVisitorStats } from "@/actions/analytics";

export async function GET() {
  const [counts, activity, visitors] = await Promise.all([
    getTableCounts(),
    getActivitySummary(),
    getVisitorStats(),
  ]);

  return Response.json({ counts, activity, visitors });
}
