import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import EventTable from "@/components/admin/EventTable";

export default async function EventsPage() {
  await requirePage("manage_events");
  const items = await db.getAll<any>("events").catch(() => []);
  return <EventTable initialData={items} />;
}
