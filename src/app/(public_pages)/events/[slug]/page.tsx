import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/ui/Markdown";
import EventDetailClient from "./EventDetailClient";
import { SITE_URL } from "@/lib/site";
import { getPublicSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

const baseUrl = SITE_URL;

function toIsoDateTime(date: string, time?: string): string {
  const d = (date || "").trim();
  if (!d) return "";
  if (d.includes("T")) return d;
  const base = d.slice(0, 10);
  if (!base) return "";
  if (!time) return base;
  const m = time.trim().toLowerCase().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!m) return base;
  let hour = parseInt(m[1], 10);
  const minute = m[2];
  if (m[3] === "pm" && hour < 12) hour += 12;
  if (m[3] === "am" && hour === 12) hour = 0;
  return `${base}T${String(hour).padStart(2, "0")}:${minute}:00`;
}

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
  const settings = await getPublicSiteSettings();
  const contact = (settings?.contact_info as { email?: string; phone?: string } | undefined) || {};
  const orgName = "Brilliant Minds Ambassadors Club";
  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.desc || event.description || "",
        startDate: toIsoDateTime(event.event_date || event.date || "", event.time || ""),
        endDate: toIsoDateTime(event.event_date || event.date || "", event.time || ""),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        image: event.img || event.image || "",
        organizer: {
          "@type": "Organization",
          name: orgName,
          url: SITE_URL,
          email: contact.email || undefined,
          telephone: contact.phone || undefined,
        },
        performer: {
          "@type": "Organization",
          name: orgName,
          url: SITE_URL,
        },
        location: {
          "@type": "Place",
          name: event.venue || "BMAC Jos",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Jos",
            addressRegion: "Plateau",
            addressCountry: "NG",
          },
        },
        offers: {
          "@type": "Offer",
          price: Number(event.price || 0),
          priceCurrency: "NGN",
          url: `${baseUrl}/events/${event.slug || event.id}`,
          availability: "https://schema.org/InStock",
          validFrom:
            event.registrationDeadline || event.registration_deadline || toIsoDateTime(event.event_date || event.date || ""),
        },
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
      <EventDetailClient
        id={slug}
        initialEvents={events || []}
        initialTestimonials={testimonials || []}
        visionContent={<Markdown>{event?.long_desc || event?.longDesc || ""}</Markdown>}
      />
    </>
  );
}
