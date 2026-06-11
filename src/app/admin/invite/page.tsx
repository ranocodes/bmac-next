import { getInvitations } from "@/actions/invitations";
import InviteUserForm from "@/components/admin/InviteUserForm";

export default async function InvitePage() {
  const invites = await getInvitations();
  return <InviteUserForm initialData={invites} />;
}
