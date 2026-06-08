export type EventCategory = "Workshop" | "Competition" | "Culture" | "Mentorship" | "Education" | "Community" | "Partnership";

export interface Program {
  id: string;
  title: string;
  desc: string;
  longDesc: string;
  img: string;
  icon: string; // Changed to string name
  color: string;
  details: string;
  variant?: "default" | "featured";
  status?: "draft" | "published";
  skills?: string[];
  faqs?: { q: string; a: string }[];
  landingPage?: boolean;
}

export interface EventPass {
  id: string;
  date: string;
  title: string;
  venue: string;
  time: string;
  category: string; // Changed from EventCategory to string to support new categories
  desc: string;
  longDesc: string;
  isPaid?: boolean;
  price?: number;
  features?: string[];
  status?: "draft" | "published";
}

export interface NewsArticle {
  id: string;
  date: string;
  title: string;
  desc: string;
  content: string;
  img: string;
  category: string;
  featured?: boolean;
  status?: "draft" | "published";
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  img: string;
  status?: "draft" | "published";
}

export interface ImpactStat {
  num: string;
  label: string;
  icon: string; // Changed to string name
}

export interface GalleryItem {
  id: string;
  img: string;
  category: string;
  alt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  designation: string;
  quote: string;
  src: string;
  status?: "draft" | "published";
}

export interface SiteSettings {
  id: string;
  logo_text: string;
  navigation: { name: string; href: string }[];
  social_links: { name: string; href: string; icon: string }[];
  copyright: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface AdminUser {
  email: string;
  password: string;
}
