"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TrackView() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const timeout = setTimeout(() => {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {});
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname]);

  return null;
}
