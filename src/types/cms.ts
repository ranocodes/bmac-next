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
  id: string;
  num: string;
  label: string;
  icon: string;
  status?: "draft" | "published";
}

export interface GalleryItem {
  id: string;
  img: string;
  category: string;
  alt: string;
  status?: "draft" | "published";
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

export type AdminRole = "super_admin" | "administrator" | "moderator";

export type Permission =
  | "manage_users"
  | "edit_content"
  | "manage_courses"
  | "manage_partners"
  | "view_analytics"
  | "access_settings"
  | "delete_records"
  | "manage_moderators";

export interface Partner {
  id: string;
  name: string;
  logo: string;
  url?: string;
  status?: "active" | "hidden";
  order: number;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  role: AdminRole;
  permissions: Permission[];
  createdAt: number;
}

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface PaymentRecord {
  id: string;
  reference: string;
  source_type: "event_registration" | "donation";
  source_id: string;
  amount: number;
  currency: string;
  payer_email: string;
  payer_name: string;
  status: PaymentStatus;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: number;
  ip?: string;
}

export type PersonRole =
  | "attendee"
  | "donor"
  | "applicant"
  | "volunteer"
  | "partner contact"
  | "member"
  | "admin";

export type PersonRecordKind =
  | "event_registration"
  | "donation"
  | "member"
  | "volunteer"
  | "partner"
  | "program"
  | "contact"
  | "admin";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roles: PersonRole[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonRecord {
  id: string;
  personId: string;
  kind: PersonRecordKind;
  refId: string;
  refTitle: string;
  status: string;
  meta: Record<string, unknown>;
  createdAt: string;
}

export type PersonRow = Person & { recordCount: number };
