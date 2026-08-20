import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import EventForm from "@/components/admin/EventForm";

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
  try {
    await requirePage("manage_events");
    const { id } = await props.params;
    const item = await db.getById<any>("events", id).catch(() => null);
    return <EventForm initialData={item} />;
  } catch (e) {
    console.error("EditEventPage error:", e);
    return <div className="p-6 text-center text-destructive">Failed to load event.</div>;
  }
}
