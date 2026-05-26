import React from "react";
import { getNews, getEvents } from "@/lib/cms";
import NewsClient from "./NewsClient";

export const revalidate = 3600;

export default async function NewsPage() {
  const news = await getNews();
  const events = await getEvents();

  return (
    <main suppressHydrationWarning className="bg-background">
      <NewsClient news={news} events={events} />
    </main>
  );
}
