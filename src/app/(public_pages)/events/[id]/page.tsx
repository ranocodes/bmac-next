import { db } from "@/lib/db";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = (await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (e: any) => e.status === "published"
  );
  const testimonials = (await db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (t: any) => t.status === "published"
  );
  return <EventDetailClient id={id} initialEvents={events || []} initialTestimonials={testimonials || []} />;
}
