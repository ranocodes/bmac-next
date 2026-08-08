-- BMAC feature: per-kind Google Forms links + DB-backed email templates + admin notifications
-- Applied: 2026-08-08

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS google_forms jsonb NOT NULL DEFAULT '{"join":"","volunteer":"","school":"","partner":""}'::jsonb,
  ADD COLUMN IF NOT EXISTS email_templates jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id text PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT FALSE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx
  ON public.admin_notifications (created_at DESC);
