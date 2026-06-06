import React from "react";
import { mockNews, mockEvents } from "@/data/mock-data";
import NewsClient from "./NewsClient";

export default function NewsPage() {
  const mappedNews = mockNews.map((n) => ({
    id: n.id,
    title: n.title,
    date: n.date,
    category: n.category,
    featured: n.featured,
    desc: n.description,
    img: n.img_url,
    content: n.content
  }));

  const mappedEvents = mockEvents.map((e) => ({
    id: e.id,
    title: e.title,
    date: new Date(e.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: e.time,
    venue: e.venue,
    desc: e.description,
    longDesc: e.longDesc,
    category: e.category
  }));

  return (
    <main suppressHydrationWarning className="bg-background">
      <NewsClient news={mappedNews} events={mappedEvents} />
    </main>
  );
}
