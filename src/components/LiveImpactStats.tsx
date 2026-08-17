import { db } from "@/lib/db";

interface LiveStat {
  num: string;
  label: string;
  icon: string;
}

export default async function LiveImpactStats({ className = "" }: { className?: string }) {
  const rows = await db.query<{
    total_people: string;
    volunteers: string;
    members: string;
    programs: string;
    events: string;
    team: string;
  }>(`
    SELECT
      (SELECT COUNT(*) FROM public.people) as total_people,
      (SELECT COUNT(*) FROM public.people WHERE roles @> '["volunteer"]'::jsonb) as volunteers,
      (SELECT COUNT(*) FROM public.people WHERE roles @> '["member"]'::jsonb) as members,
      (SELECT COUNT(*) FROM public.programs WHERE status = 'published') as programs,
      (SELECT COUNT(*) FROM public.events WHERE status = 'published') as events,
      (SELECT COUNT(*) FROM public.team_members WHERE status = 'published') as team
  `);

  const r = rows[0];
  const stats: LiveStat[] = [
    { num: r.total_people || "0", label: "People Reached", icon: "Users" },
    { num: r.programs || "0", label: "Programs Running", icon: "BookOpen" },
    { num: r.volunteers || "0", label: "Volunteers", icon: "HandHeart" },
    { num: r.events || "0", label: "Events Hosted", icon: "Calendar" },
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center p-4">
          <p className="text-2xl md:text-3xl font-display font-bold text-secondary">{stat.num}</p>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
