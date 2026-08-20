import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { getTableCounts, getActivitySummary, getVisitorStats } from "@/actions/analytics";

export async function GET() {
  try {
    await requirePermission("view_analytics");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [counts, activity, visitors] = await Promise.all([
    getTableCounts(),
    getActivitySummary(),
    getVisitorStats(),
  ]);

  return NextResponse.json({ counts, activity, visitors });
}
