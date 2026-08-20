import { db } from "@/lib/db";
import { requirePage } from "@/lib/auth/server";
import ProgramForm from "@/components/admin/ProgramForm";

export default async function EditProgramPage(props: { params: Promise<{ id: string }> }) {
  try {
    await requirePage("manage_programs");
    const { id } = await props.params;
    const item = await db.getById<any>("programs", id).catch(() => null);
    return <ProgramForm initialData={item} />;
  } catch (e) {
    console.error("EditProgramPage error:", e);
    return <div className="p-6 text-center text-destructive">Failed to load program.</div>;
  }
}
