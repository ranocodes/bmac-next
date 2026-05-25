import React from "react";
import { getEventById } from "@/lib/cms";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <a href="/events" className="text-primary font-bold">Back to Events</a>
        </div>
      </div>
    );
  }

  return (
    <EventDetailClient event={event} />
  );
}
