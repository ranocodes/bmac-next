import { mockNews, mockEvents } from "@/data/mock-data";
import NewsDetailClient from "./NewsDetailClient";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const article = mockNews.find((n) => n.id === id);

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

  const mappedArticle = {
    ...article,
    id: article.id,
    desc: article.description,
    img: article.img_url
  };

  const mappedNews = mockNews
    .filter((n) => n.id !== id)
    .slice(0, 3)
    .map((n) => ({
      ...n,
      id: n.id,
      desc: n.description,
      img: n.img_url
    }));

  const mappedEvents = mockEvents.map((e) => ({
    ...e,
    id: e.id,
    date: e.event_date,
    desc: e.description
  }));

  return (
    <NewsDetailClient 
      article={mappedArticle} 
      relatedStories={mappedNews} 
      events={mappedEvents} 
    />
  );
}
