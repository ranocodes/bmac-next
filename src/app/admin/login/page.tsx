import { db } from "@/lib/db";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const hasUsers = await db.exists("admin_users");
  return <LoginForm isFirstSetup={!hasUsers} />;
}
