import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import TestimonialForm from "@/components/admin/TestimonialForm";

export default async function EditTestimonialPage(props: { params: Promise<{ id: string }> }) {
  await requirePage("manage_testimonials");
  const { id } = await props.params;
  const item = await db.getById<any>("testimonials", id).catch(() => null);
  return <TestimonialForm initialData={item} />;
}
