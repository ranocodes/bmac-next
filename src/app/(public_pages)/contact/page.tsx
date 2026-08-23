import type { Metadata } from "next";
import { editorial } from "../get-involved/editorial-font";
import { getPublicSiteSettings } from "@/lib/site-settings";
import Contact from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with BMAC Jos. Visit our hub on Nalado Street, Jos, or reach us by email, phone or WhatsApp.",
  alternates: { canonical: "contact" },
};

export const revalidate = 300;

export default async function ContactPage() {
  const settings = await getPublicSiteSettings();
  const contactInfo = settings?.contact_info || null;
  return (
    <div className={editorial.variable}>
      <Contact contactInfo={contactInfo} />
    </div>
  );
}
