import { db } from "@/lib/db";
import ProgramForm from "@/components/admin/ProgramForm";

export default async function EditProgramPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const item = await db.getById<any>("programs", id).catch(() => null);
  return <ProgramForm initialData={item} />;
}
