import { redirect } from "next/navigation";

export default function PeopleRedirect() {
  redirect("/admin/members");
}
