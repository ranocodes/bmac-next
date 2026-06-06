import { Program } from "@/types/cms";
import { mockPrograms } from "@/data/mock-data";
import ProgramDetailClient from "./ProgramDetailClient";

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const programData = mockPrograms.find((p) => p.id === id);

  if (!programData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Program Not Found</h2>
          <a href="/programs" className="text-primary font-bold">Back to Curriculum</a>
        </div>
      </div>
    );
  }

  const program: Program = {
    ...programData,
    id: programData.id,
    img: programData.img_url,
    desc: programData.description,
    icon: programData.icon_name,
    color: programData.color_class,
    variant: programData.variant as Program["variant"]
  };

  const otherPathways: Program[] = mockPrograms
    .filter((p) => p.id !== id)
    .slice(0, 3)
    .map((p) => ({
      ...p,
      id: p.id,
      img: p.img_url,
      desc: p.description,
      icon: p.icon_name,
      color: p.color_class,
      variant: p.variant as Program["variant"]
    }));

  return (
    <ProgramDetailClient program={program} otherPathways={otherPathways} />
  );
}
