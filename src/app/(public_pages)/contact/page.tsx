import type { Metadata } from "next";
import { db } from "@/lib/db";
import Contact from "./ContactClient";

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with BMAC Jos. Visit our hub on Nalado Street, Jos, or reach us by email, phone or WhatsApp.',
  alternates: { canonical: "contact" },
};


export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await db.query<any>("SELECT contact_info FROM public.site_settings LIMIT 1");
  const contactInfo = settings?.[0]?.contact_info || null;
  return <Contact contactInfo={contactInfo} />;
}
