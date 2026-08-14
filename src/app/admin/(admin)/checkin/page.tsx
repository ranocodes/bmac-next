import { requirePage } from "@/lib/auth/server";
import { db } from "@/lib/db";
import CheckInClient from "@/components/admin/CheckInClient";

export const dynamic = "force-dynamic";

export default async function CheckInPage() {
  await requirePage("check_in_attendees");
  const events = await db.query<{ id: string; title: string; date: string }>(
    "SELECT id, title, date FROM public.events WHERE status = 'published' ORDER BY date DESC"
  ).catch(() => []);
  return <CheckInClient events={events} />;
}
