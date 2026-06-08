import { mockStats, mockTestimonials } from "@/data/mock-data";
import HomeClient from "../HomeClient";

export default function HomePage() {
  const mappedTestimonials = mockTestimonials.map((t) => ({
    quote: t.quote,
    name: t.name,
    designation: t.designation,
    src: t.src
  }));

  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient 
        stats={mockStats} 
        testimonials={mappedTestimonials} 
      />
    </main>
  );
}
