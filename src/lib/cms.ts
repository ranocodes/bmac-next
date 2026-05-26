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
  if (!fs.existsSync(programsDir)) return [];
  const filenames = fs.readdirSync(programsDir);

  // Filter for .md files only to avoid system files like .DS_Store
  return filenames
    .filter((fn) => fn.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(programsDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      return { ...data, longDesc: content || data.body } as Program;
    });
}

export async function getEvents(): Promise<EventPass[]> {
  const eventsDir = path.join(CONTENT_PATH, "events");
  if (!fs.existsSync(eventsDir)) return [];
  const filenames = fs.readdirSync(eventsDir);

  return filenames
    .filter((fn) => fn.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(eventsDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      return { ...data, longDesc: content || data.body } as EventPass;
    });
}

export async function getNews(): Promise<NewsArticle[]> {
  const newsDir = path.join(CONTENT_PATH, "news");
  if (!fs.existsSync(newsDir)) return [];
  const filenames = fs.readdirSync(newsDir);

  return filenames
    .filter((fn) => fn.endsWith(".md"))
    .map((filename) => {
      const filePath = path.join(newsDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);
      return { ...data, content: content || data.body } as NewsArticle;
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
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.members || data;
}

export async function getImpactStats() {
  const filePath = path.join(CONTENT_PATH, "settings/stats.json");
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.stats || data;
}

export async function getGalleryItems() {
  const filePath = path.join(CONTENT_PATH, "settings/gallery.json");
  if (!fs.existsSync(filePath)) return [];
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return data.items || data;
}

export async function getTestimonials() {
  const filePath = path.join(CONTENT_PATH, "settings/testimonials.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export async function getSiteSettings() {
  const filePath = path.join(CONTENT_PATH, "settings/site.json");
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}
