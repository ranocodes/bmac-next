import { db } from "@/lib/db";
import EventTable from "@/components/admin/EventTable";

export default async function EventsPage() {
  const items = await db.getAll<any>("events").catch(() => []);
  return <EventTable initialData={items} />;
}
