import { Program } from "@/types/cms";
import { mockPrograms, mockStats, mockTestimonials } from "@/data/mock-data";
import HomeClient from "../HomeClient";

export default function HomePage() {
  const mappedPrograms: Program[] = mockPrograms.map((p) => ({
    id: p.id,
    title: p.title,
    desc: p.description,
    longDesc: p.longDesc,
    img: p.img_url,
    icon: p.icon_name,
    color: p.color_class,
    details: p.details,
    variant: p.variant as Program["variant"],
    description: p.description,
    img_url: p.img_url,
    icon_name: p.icon_name,
    color_class: p.color_class
  }));

  const mappedTestimonials = mockTestimonials.map((t) => ({
    quote: t.quote,
    name: t.name,
    designation: t.designation,
    src: t.src
  }));

  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient 
        programs={mappedPrograms} 
        stats={mockStats} 
        testimonials={mappedTestimonials} 
      />
    </main>
  );
}
