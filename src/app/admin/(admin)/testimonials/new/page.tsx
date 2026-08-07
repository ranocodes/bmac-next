import TestimonialForm from "@/components/admin/TestimonialForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewTestimonialPage() {
  await requirePage("manage_testimonials");
  return <TestimonialForm />;
}
