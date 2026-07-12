import LoginForm from "@/components/admin/LoginForm";
import * as authClient from "@/lib/auth/client";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const count = await authClient.getAdminsCount();
  return <LoginForm hasAdmins={count > 0} />;
}
