import { db } from "@/lib/db";
import HomeClient from "../HomeClient";
import DonationProgress from "@/components/ui/DonationProgress";
import LiveImpactStats from "@/components/LiveImpactStats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allPrograms, allTestimonials, allStats, allPartners] = await Promise.all([
    db.getAll<any>("programs", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("testimonials", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("impact_stats", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("partners", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  const programs = (allPrograms || []).filter((p: any) => p.status === "published");
  const testimonials = (allTestimonials || []).filter((t: any) => t.status === "published");
  const stats = (allStats || []).filter((s: any) => s.status === "published");
  return (
    <main suppressHydrationWarning className="bg-background">
      <HomeClient
        initialPrograms={programs}
        initialTestimonials={testimonials}
        initialStats={stats}
        initialPartners={allPartners || []}
      />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16 md:pb-24">
        <LiveImpactStats />
        <DonationProgress />
      </div>
    </main>
  );
}
