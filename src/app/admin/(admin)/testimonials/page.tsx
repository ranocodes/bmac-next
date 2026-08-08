import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import TestimonialTable from "@/components/admin/TestimonialTable";

export default async function TestimonialsPage() {
  await requirePage("manage_testimonials");
  const items = await db.getAll<any>("testimonials").catch(() => []);
  return <TestimonialTable initialData={items} />;
}
