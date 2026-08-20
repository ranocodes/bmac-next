import { requirePage } from "@/lib/auth/server";
import { getEventAdminDetail } from "@/actions/events";
import EventAdminDetailClient from "@/components/admin/EventAdminDetail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EventAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePage("manage_events");
    const { id } = await params;
    const data = await getEventAdminDetail(id);
    if (!data) notFound();
    return <EventAdminDetailClient initialData={data} eventId={id} />;
  } catch (e) {
    console.error("EventAdminDetailPage error:", e);
    notFound();
  }
}
