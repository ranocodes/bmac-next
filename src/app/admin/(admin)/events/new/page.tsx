import EventForm from "@/components/admin/EventForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewEventPage() {
  await requirePage("manage_events");
  return <EventForm />;
}
