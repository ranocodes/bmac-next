import { db } from "@/lib/db";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [team, stats, settings] = await Promise.all([
    db.getAll<any>("team_members", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("impact_stats", { orderBy: "created_at", orderDir: "DESC" }),
    db.query<any>("SELECT about_story FROM public.site_settings LIMIT 1"),
  ]);
  const story = settings?.[0]?.about_story || null;
  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient initialTeam={team || []} initialStats={stats || []} initialStory={story} />
    </main>
  );
}
