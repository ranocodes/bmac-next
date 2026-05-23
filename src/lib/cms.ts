import { 
  programsData, 
  eventsData, 
  newsArticles, 
  teamData, 
  impactStats, 
  galleryData 
} from "@/data/mockData";
import { 
  Program, 
  EventPass, 
  NewsArticle, 
  TeamMember, 
  ImpactStat, 
  GalleryItem 
} from "@/types/cms";

/**
 * CMS Data Fetching Layer
 * These functions currently return local mock data but are structured 
 * to be replaced with real CMS API calls (Sanity, Payload, etc.)
 */

export async function getPrograms(): Promise<Program[]> {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => resolve(programsData), 500);
  });
}

export async function getProgramById(id: string): Promise<Program | undefined> {
  const programs = await getPrograms();
  return programs.find((p) => p.id === id);
}

export async function getEvents(): Promise<EventPass[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(eventsData), 500);
  });
}

export async function getEventById(id: string): Promise<EventPass | undefined> {
  const events = await getEvents();
  return events.find((e) => e.id === id);
}

export async function getNews(): Promise<NewsArticle[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(newsArticles), 500);
  });
}

export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  const articles = await getNews();
  return articles.find((a) => a.id === id);
}

export async function getTeam(): Promise<TeamMember[]> {
  return Promise.resolve(teamData);
}

export async function getImpactStats(): Promise<ImpactStat[]> {
  return Promise.resolve(impactStats);
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return Promise.resolve(galleryData);
}
