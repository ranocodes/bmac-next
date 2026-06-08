import EventsClient from "./EventsClient";

export default function EventsPage() {
  return (
    <main suppressHydrationWarning className="bg-background">
      <EventsClient />
    </main>
  );
}
