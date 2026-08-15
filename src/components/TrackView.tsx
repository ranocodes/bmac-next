"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getUtmFromSearch, detectDevice, detectBrowser } from "@/lib/analytics/track";

export default function TrackView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const timeout = setTimeout(() => {
      const utm = getUtmFromSearch(window.location.search);
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          ...utm,
          deviceType: detectDevice(navigator),
          browser: detectBrowser(navigator.userAgent),
        }),
        keepalive: true,
      }).catch(() => {});
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
