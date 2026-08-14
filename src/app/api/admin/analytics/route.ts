import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/server";
import { getOperationalAnalytics } from "@/actions/analytics";

export async function GET() {
  try {
    await requirePermission("view_analytics");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const data = await getOperationalAnalytics();
  return NextResponse.json(data);
}
