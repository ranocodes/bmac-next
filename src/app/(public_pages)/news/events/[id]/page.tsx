import { mockEvents } from "@/data/mock-data";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = mockEvents.find((e) => e.id === id);

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

  const mappedEvent = {
    ...event,
    id: event.id,
    date: event.event_date,
    desc: event.description
  };

  return (
    <EventDetailClient event={mappedEvent} />
  );
}
