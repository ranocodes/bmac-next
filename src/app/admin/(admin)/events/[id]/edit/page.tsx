import { db } from "@/lib/db";
import EventForm from "@/components/admin/EventForm";

export default async function EditEventPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("events", id).catch(() => null);
  return <EventForm initialData={item} />;
}
