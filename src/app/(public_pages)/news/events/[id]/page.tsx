import { db } from "@/lib/db";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" });
  return <EventDetailClient id={id} initialEvents={events || []} />;
}
