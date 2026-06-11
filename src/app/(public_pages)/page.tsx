import { db } from "@/lib/db";
import HomeClient from "../HomeClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [programs, testimonials, stats, partners] = await Promise.all([
    db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("impact_stats", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("partners", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient
        initialPrograms={programs || []}
        initialTestimonials={testimonials || []}
        initialStats={stats || []}
        initialPartners={partners || []}
      />
    </main>
  );
}
