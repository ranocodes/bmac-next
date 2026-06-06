import React from "react";
import { mockEvents } from "@/data/mock-data";
import EventsClient from "./EventsClient";

export default function EventsPage() {
  const mappedEvents = mockEvents.map((e) => ({
    id: e.id,
    title: e.title,
    date: new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: e.time,
    venue: e.venue,
    desc: e.description,
    longDesc: e.longDesc,
    category: e.category,
    isPaid: e.is_paid,
    price: e.price
  }));

  return (
    <main suppressHydrationWarning className="bg-background">
      <EventsClient events={mappedEvents} />
    </main>
  );
}
