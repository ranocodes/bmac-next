import { getPeople } from "@/actions/people";
import PeopleTable from "@/components/admin/PeopleTable";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  const people = await getPeople().catch(() => []);
  return <PeopleTable initialData={people} />;
}
