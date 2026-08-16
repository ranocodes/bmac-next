import { db } from "@/lib/db";
import Contact from "./ContactClient";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await db.query<any>("SELECT contact_info FROM public.site_settings LIMIT 1");
  const contactInfo = settings?.[0]?.contact_info || null;
  return <Contact contactInfo={contactInfo} />;
}
