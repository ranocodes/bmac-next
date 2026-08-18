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
  applicationsOpen?: boolean;
  isPaid?: boolean;
  paymentTiming?: "immediate" | "after_acceptance";
  price?: number;
  duration?: string;
  effort?: string;
  audienceFor?: string[];
  audienceNotFor?: string[];
  instructorName?: string;
  instructorBio?: string;
  instructorPhoto?: string;
  instructors?: ProgramInstructor[];
  curriculum?: { title: string; outcome: string }[];
  includes?: string[];
  refundPolicy?: string;
  testimonials?: { name: string; designation: string; quote: string }[];
}

export interface ProgramApplication {
  id: string;
  programId: string;
  personId: string;
  status: "submitted" | "in_review" | "accepted" | "waitlisted" | "rejected" | "withdrawn";
  motivation: string;
  dateOfBirth?: string;
  consent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  id: string;
  programId: string;
  title: string;
  startDate: string;
  endDate: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  cohortId: string;
  personId: string;
  status: "enrolled" | "completed" | "dropped" | "suspended";
  joinedAt: string;
}

export interface AttendanceRecord {
  id: string;
  cohortId: string;
  personId: string;
  sessionDate: string;
  present: boolean;
  markedBy: string;
  markedAt: string;
}

export interface Donation {
  id: string;
  personId: string;
  amount: number;
  currency: string;
  reference: string;
  status: "pending" | "completed" | "failed" | "refunded";
  receiptSent: boolean;
  createdAt: string;
  updatedAt: string;
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
  capacity?: number;
  capacityUsed?: number;
  registrationDeadline?: string;
  maxPerPerson?: number;
  allowPublicRegistration?: boolean;
  remindersEnabled?: boolean;
  img?: string;
  agenda?: { time: string; title: string }[];
  audienceFor?: string[];
  audienceNotFor?: string[];
  faqs?: { q: string; a: string }[];
  policies?: string;
}

export type WorkflowStatus = "open" | "in_progress" | "resolved" | "closed";
export type WorkflowKind =
  | "contact"
  | "member"
  | "volunteer"
  | "partner"
  | "program"
  | "event_registration"
  | "donation"
  | "ticket"
  | "application-status";
export type WorkflowPriority = "low" | "normal" | "high" | "urgent";

export interface WorkflowRecord {
  id: string;
  kind: WorkflowKind;
  refId: string;
  title: string;
  summary: string;
  status: WorkflowStatus;
  priority: WorkflowPriority;
  assigneeEmail: string;
  submitterName: string;
  submitterEmail: string;
  source: string;
  details: Record<string, unknown>;
  outcome: string;
  lastContactedAt?: string;
  dueAt?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export type TicketStatus = "pending" | "confirmed" | "cancelled" | "refunded";

export interface EventTicket {
  id: string;
  reference: string;
  eventId: string;
  personId: string;
  payerName: string;
  payerEmail: string;
  quantity: number;
  amount: number;
  currency: string;
  status: TicketStatus;
  qrToken?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  marketing?: boolean;
  contact?: boolean;
  privacy?: boolean;
  acceptedAt: string;
  source: string;
  ip?: string;
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

export interface AboutStory {
  eyebrow: string;
  heading: string;
  paragraphs: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
}

export interface SiteSettings {
  id: string;
  logo_text: string;
  navigation: { name: string; href: string }[];
  social_links: { name: string; href: string; icon: string }[];
  copyright: string;
  about_story?: AboutStory;
  contact_info?: ContactInfo;
}

export interface Category {
  id: string;
  name: string;
}

export type AdminRole = "super_admin" | "administrator" | "moderator";

export type Permission =
  | "manage_news"
  | "manage_events"
  | "manage_programs"
  | "manage_gallery"
  | "manage_team"
  | "manage_testimonials"
  | "manage_categories"
  | "manage_partners"
  | "manage_stats"
  | "manage_payments"
  | "manage_people"
  | "manage_logs"
  | "manage_users"
  | "access_settings"
  | "export_data"
  | "view_analytics"
  | "manage_workflows"
  | "check_in_attendees"
  | "manage_newsletter";

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

export interface ProgramInstructor {
  name: string;
  bio: string;
  photo?: string;
  role?: string;
}

export type FormQuestionType =
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "email"
  | "phone"
  | "number";

export interface FormQuestion {
  id: string;
  type: FormQuestionType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface FormDefinition {
  id: string;
  entityType: string;
  entityId?: string;
  questions: FormQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface FormSubmission {
  id: string;
  entityType: string;
  entityId?: string;
  personId?: string;
  answers: Record<string, unknown>;
  createdAt: string;
}
