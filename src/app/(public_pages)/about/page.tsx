import { db } from "@/lib/db";
import AboutClient from "./AboutClient";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [team, stats] = await Promise.all([
    db.getAll<any>("team_members", { orderBy: "created_at", orderDir: "DESC" }),
    db.getAll<any>("impact_stats", { orderBy: "created_at", orderDir: "DESC" }),
  ]);
  return (
    <main suppressHydrationWarning className="bg-background">
      <AboutClient initialTeam={team || []} initialStats={stats || []} />
    </main>
  );
}
