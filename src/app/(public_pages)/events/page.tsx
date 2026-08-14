import { db } from "@/lib/db";
import EventsClient from "./EventsClient";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = (await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (e: any) => e.status === "published"
  );
  return (
    <main suppressHydrationWarning className="bg-background">
      <EventsClient initialEvents={events || []} />
    </main>
  );
}
