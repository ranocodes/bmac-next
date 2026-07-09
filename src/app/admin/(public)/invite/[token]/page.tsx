import AcceptInviteForm from "@/components/admin/AcceptInviteForm";
import { getInviteByToken } from "@/lib/auth/super-admin";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";

export default async function InvitePage({ params }: Props) {
  const { token } = await params;
  const invite = await getInviteByToken(token);
  if (!invite.valid) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-secondary mb-2">Invalid or expired invite</h1>
          <p className="text-sm text-muted-foreground">{invite.error}</p>
        </div>
      </div>
    );
  }

  return <AcceptInviteForm token={token} email={invite.email} firstName={invite.firstName} />;
}
