import { db } from "@/lib/db";
import TestimonialTable from "@/components/admin/TestimonialTable";

export default async function TestimonialsPage() {
  const items = await db.getAll<any>("testimonials").catch(() => []);
  return <TestimonialTable initialData={items} />;
}
