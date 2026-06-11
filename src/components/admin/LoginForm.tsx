"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

export default function LoginForm({ isFirstSetup }: { isFirstSetup: boolean }) {
  if (isFirstSetup) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-10">
            <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">BMAC<span className="text-primary">.</span></h1>
            <p className="text-sm text-muted-foreground mt-2">First-time setup</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create your Super Admin account</p>
          </div>
          <SignUpButton mode="redirect" forceRedirectUrl="/admin">
            <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
              Create Admin Account
            </button>
          </SignUpButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold tracking-tight text-secondary">BMAC<span className="text-primary">.</span></h1>
          <p className="text-sm text-muted-foreground mt-2">Admin dashboard</p>
        </div>
        <SignInButton mode="redirect" forceRedirectUrl="/admin">
          <button className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all">
            Sign in with Clerk
          </button>
        </SignInButton>
        <p className="text-xs text-muted-foreground/60 mt-4">
          Don't have an account?{" "}
          <Link href="/admin/accept-invite" className="text-primary hover:underline font-medium">
            Use an invite code
          </Link>
        </p>
      </div>
    </div>
  );
}
