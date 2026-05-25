import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Program, EventPass, NewsArticle } from "@/types/cms";

const CONTENT_PATH = path.join(process.cwd(), "content");

/**
 * CMS Data Fetching Layer
 * Now reading directly from Markdown/JSON files in /content
 */

export async function getPrograms(): Promise<Program[]> {
  const programsDir = path.join(CONTENT_PATH, "programs");
  const filenames = fs.readdirSync(programsDir);

  return filenames.map((filename) => {
    const filePath = path.join(programsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    return { ...data, longDesc: content } as Program;
  });
}

export async function getEvents(): Promise<EventPass[]> {
  const eventsDir = path.join(CONTENT_PATH, "events");
  const filenames = fs.readdirSync(eventsDir);

  return filenames.map((filename) => {
    const filePath = path.join(eventsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    return { ...data, longDesc: content } as EventPass;
  });
}

export async function getNews(): Promise<NewsArticle[]> {
  const newsDir = path.join(CONTENT_PATH, "news");
  const filenames = fs.readdirSync(newsDir);

  return filenames.map((filename) => {
    const filePath = path.join(newsDir, filename);
    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);
    return { ...data, content } as NewsArticle;
  });
}

// These keep existing signatures but fetch from FS
export async function getProgramById(id: string): Promise<Program | undefined> {
  const programs = await getPrograms();
  return programs.find((p) => p.id === id);
}

export async function getEventById(id: string): Promise<EventPass | undefined> {
  const events = await getEvents();
  return events.find((e) => e.id === id);
}

export async function getNewsById(id: string): Promise<NewsArticle | undefined> {
  const articles = await getNews();
  return articles.find((a) => a.id === id);
}

// Simple JSON loaders for non-content-heavy data
export async function getTeam() {
  const filePath = path.join(CONTENT_PATH, "settings/team.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export async function getImpactStats() {
  const filePath = path.join(CONTENT_PATH, "settings/stats.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export async function getGalleryItems() {
  const filePath = path.join(CONTENT_PATH, "settings/gallery.json");
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
