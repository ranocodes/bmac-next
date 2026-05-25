import React from "react";
import { getNews, getEvents } from "@/lib/cms";
import NewsClient from "./NewsClient";

// Force dynamic to ensure data is always fresh if we move to real CMS later
export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const news = await getNews();
  const events = await getEvents();

  return (
    <main suppressHydrationWarning className="bg-background">
      <NewsClient news={news} events={events} />
    </main>
  );
}
