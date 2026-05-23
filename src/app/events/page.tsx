import React from "react";
import { getEvents } from "@/lib/cms";
import EventsClient from "./EventsClient";

// Force dynamic to ensure data is always fresh if we move to real CMS later
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main suppressHydrationWarning className="bg-background">
      <EventsClient events={events} />
    </main>
  );
}
