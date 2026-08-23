"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "bmac-cookie-consent";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true);
    } catch {
      /* storage unavailable */
    }
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-stone-600">
          We use cookies to keep you signed in and understand how the site is
          used. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-stone-900">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-stone-900">
            Terms of Service
          </Link>
          .
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-700"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
