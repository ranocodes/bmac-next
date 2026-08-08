import ProgramForm from "@/components/admin/ProgramForm";
import { requirePage } from "@/lib/auth/server";

export default async function NewProgramPage() {
  await requirePage("manage_programs");
  return <ProgramForm />;
}
