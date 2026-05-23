import React from "react";

export type EventCategory = "Workshop" | "Competition" | "Culture" | "Mentorship" | "Education" | "Community" | "Partnership";

export interface Program {
  id: string;
  title: string;
  desc: string;
  longDesc: string;
  img: string;
  icon: React.ReactNode;
  color: string;
  details: string;
  variant?: "default" | "featured";
}

export interface EventPass {
  id: string;
  date: string;
  title: string;
  venue: string;
  time: string;
  category: EventCategory;
  desc: string;
  longDesc: string;
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
}

export interface TeamMember {
  name: string;
  role: string;
  img: string;
}

export interface ImpactStat {
  num: string;
  label: string;
  icon: React.ReactNode;
}

export interface GalleryItem {
  img: string;
  category: string;
  alt: string;
}
