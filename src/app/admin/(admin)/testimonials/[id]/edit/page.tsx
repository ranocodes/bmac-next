import { db } from "@/lib/db";
import TestimonialForm from "@/components/admin/TestimonialForm";

export default async function EditTestimonialPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("testimonials", id).catch(() => null);
  return <TestimonialForm initialData={item} />;
}
