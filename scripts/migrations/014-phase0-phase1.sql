-- BMAC feature: Phase 0 security + Phase 1 notifications/giving
-- Idempotent — safe to re-apply.

-- Login brute-force protection
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id text PRIMARY KEY,
  email text NOT NULL DEFAULT '',
  ip text NOT NULL DEFAULT '',
  success boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_attempts_lookup_idx
  ON public.login_attempts (email, ip, success, created_at DESC);

-- Public form spam guard (honeypot + rate limit)
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id text PRIMARY KEY,
  key text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_submissions_key_idx
  ON public.form_submissions (key, created_at DESC);

-- Event waitlist + auto-promote
CREATE TABLE IF NOT EXISTS public.event_waitlist (
  id text PRIMARY KEY,
  event_id text NOT NULL,
  person_id text NOT NULL DEFAULT '',
  name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'waiting',
  created_at timestamptz NOT NULL DEFAULT now(),
  promoted_at timestamptz
);

CREATE INDEX IF NOT EXISTS event_waitlist_event_idx
  ON public.event_waitlist (event_id, status, created_at ASC);

-- Newsletter broadcast tracking
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_sent_at timestamptz;

-- Donation goal on site settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS donation_goal integer NOT NULL DEFAULT 0;

-- Cron reminder tracking (per event)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS last_reminder_sent_at timestamptz;
