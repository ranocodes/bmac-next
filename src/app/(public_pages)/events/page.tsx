import { db } from "@/lib/db";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" });
  return (
    <main suppressHydrationWarning className="bg-background">
      <EventsClient initialEvents={events || []} />
    </main>
  );
}
