import type { Metadata } from "next";
import { db } from "@/lib/db";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: 'Events',
  description: 'Upcoming workshops, competitions and community events from Brilliant Minds Ambassadors Club in Jos, Nigeria.',
  alternates: { canonical: "events" },
};


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
