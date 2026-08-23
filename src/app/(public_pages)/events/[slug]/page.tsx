import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EventDetailClient from "./EventDetailClient";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

async function publishedEvents() {
  return (await db.getAll<any>("events", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (e: any) => e.status === "published"
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = (await publishedEvents()).find((e: any) => e.slug === slug || e.id === slug);
  if (!event) return {};
  const title = event.title;
  const description = (event.desc || event.description || "").slice(0, 160);
  const image = event.img || event.image || "";
  const path = `/events/${event.slug || event.id}`;
  return {
    title: `${title}`,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title}`,
      description,
      type: "article",
      url: `${baseUrl}${path}`,
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const events = await publishedEvents();
  if (!events.some((e: any) => e.slug === slug || e.id === slug)) notFound();
  const testimonials = (await db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC" })).filter(
    (t: any) => t.status === "published"
  );
  const event = events.find((e: any) => e.slug === slug || e.id === slug);
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
      <EventDetailClient id={slug} initialEvents={events || []} initialTestimonials={testimonials || []} />
    </>
  );
}
