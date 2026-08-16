import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";

export const dynamic = "force-dynamic";

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const events = (await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (e: any) => e.status === "published"
  );
  const event = events.find((e: any) => e.id === id);
  if (!event) return {};
  const title = event.title;
  const description = (event.desc || event.description || "").slice(0, 160);
  const image = event.img || event.image || "";
  return {
    title: `${title} — BMAC Jos`,
    description,
    alternates: { canonical: `/events/${id}` },
    openGraph: {
      title: `${title} — BMAC Jos`,
      description,
      type: "article",
      url: `${baseUrl}/events/${id}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const events = (await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (e: any) => e.status === "published"
  );
  if (!events.some((e: any) => e.id === id)) notFound();
  const testimonials = (await db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (t: any) => t.status === "published"
  );
  const event = events.find((e: any) => e.id === id);
  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.desc || event.description || "",
        startDate: event.event_date || event.date || "",
        location: {
          "@type": "Place",
          name: event.venue || "BMAC Jos",
        },
        image: event.img || event.image || "",
        eventStatus: "https://schema.org/EventScheduled",
        offers: event.is_paid
          ? { "@type": "Offer", price: Number(event.price || 0), priceCurrency: "NGN", availability: "https://schema.org/InStock" }
          : undefined,
      }
    : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EventDetailClient id={id} initialEvents={events || []} initialTestimonials={testimonials || []} />
    </>
  );
}
