import { getAllVolunteerHours } from "@/actions/volunteer-hours";
import VolunteerHoursAdmin from "@/components/admin/VolunteerHoursAdmin";

export const dynamic = "force-dynamic";

export default async function VolunteerHoursPage() {
  const hours = await getAllVolunteerHours().catch(() => []);
  return <VolunteerHoursAdmin initialData={hours} />;
}
