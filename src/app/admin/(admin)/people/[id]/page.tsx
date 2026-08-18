import { redirect } from "next/navigation";

export default function PersonRedirect({ params }: { params: Promise<{ id: string }> }) {
  params.then(({ id }) => redirect(`/admin/members/${id}`));
  return null;
}
