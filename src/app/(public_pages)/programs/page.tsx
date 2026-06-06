import { Program } from "@/types/cms";
import { mockPrograms } from "@/data/mock-data";
import ProgramsClient from "./ProgramsClient";

export default function ProgramsPage() {
  const mappedPrograms: Program[] = mockPrograms.map((p) => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    longDesc: p.longDesc,
    img: p.img_url,
    icon: p.icon_name,
    color: p.color_class,
    details: p.details,
    variant: p.variant as Program["variant"]
  }));

  return (
    <main suppressHydrationWarning className="bg-background">
      <ProgramsClient programs={mappedPrograms} />
    </main>
  );
}
