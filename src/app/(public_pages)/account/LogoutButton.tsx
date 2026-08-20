"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutPublicUser } from "@/actions/public-auth";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logoutPublicUser();
    router.push("/login");
  }

  return (
    <button onClick={handleLogout}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors">
      <LogOut size={16} />
      Sign out
    </button>
  );
}
