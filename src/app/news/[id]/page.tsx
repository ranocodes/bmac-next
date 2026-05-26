import React from "react";
import { getNewsById, getNews, getEvents } from "@/lib/cms";
import NewsDetailClient from "./NewsDetailClient";

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getNewsById(id);
  const allNews = await getNews();
  const events = await getEvents();

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Article Not Found</h2>
          <a href="/news" className="text-primary font-bold">Back to News</a>
        </div>
      </div>
    );
  }

  const relatedStories = allNews.filter(n => n.id !== id).slice(0, 3);

  return (
    <NewsDetailClient 
      article={article} 
      relatedStories={relatedStories} 
      events={events} 
    />
  );
}
