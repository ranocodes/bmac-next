import ProgramDetailClient from "./ProgramDetailClient";

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <ProgramDetailClient id={id} />;
}
