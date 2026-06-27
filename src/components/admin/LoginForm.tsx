"use client";

import { SignIn, SignUp } from "@clerk/nextjs";

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
          <SignUp fallbackRedirectUrl="/admin" signInUrl="/admin/login" />
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
        <SignIn fallbackRedirectUrl="/admin" signUpUrl="/admin/accept-invite" />
      </div>
    </div>
  );
}