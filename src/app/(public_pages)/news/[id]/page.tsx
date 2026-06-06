import NewsDetailClient from "./NewsDetailClient";

export default async function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <NewsDetailClient id={id} />;
}
