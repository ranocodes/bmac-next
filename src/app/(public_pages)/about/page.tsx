import type { Metadata } from "next";
import { db } from "@/lib/db";
import AboutClient from "./AboutClient";
import LiveImpactStats from "@/components/LiveImpactStats";

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Brilliant Minds Academic & Career Foundation — our mission, story, team and impact in Jos, Nigeria.',
  alternates: { canonical: "about" },
};


export const revalidate = 300;

export default async function AboutPage() {
  const [team, stats, settings] = await Promise.all([
    db.getAll<any>("team_members", { orderBy: "created_at", orderDir: "DESC" }).catch(() => []),
    db.getAll<any>("impact_stats", { orderBy: "created_at", orderDir: "DESC" }).catch(() => []),
    db.query<any>("SELECT about_story FROM public.site_settings LIMIT 1").catch(() => []),
  ]);
  const story = settings?.[0]?.about_story || null;
  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient initialTeam={team || []} initialStats={stats || []} initialStory={story} />
      <section className="py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-6">
          <LiveImpactStats />
        </div>
      </section>
    </main>
  );
}
