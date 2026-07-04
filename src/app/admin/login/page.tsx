import LoginForm from "@/components/admin/LoginForm";
import { getSuperAdminCount } from "@/lib/auth/super-admin";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const count = await getSuperAdminCount();
  return <LoginForm hasAdmins={count > 0} />;
}
