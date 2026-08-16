-- 019: newsletter broadcast history, templates, and send tracking
-- Tables: broadcast_log (send history + scheduled sends), newsletter_templates
-- Column: newsletter_subscribers.last_error_at (track last send failure)

CREATE TABLE IF NOT EXISTS public.broadcast_log (
  id text PRIMARY KEY,
  subject text NOT NULL,
  body_md text NOT NULL,
  body_html text,
  audience_source text,
  recipient_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  error_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'scheduled',
  scheduled_for timestamptz,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS broadcast_log_created_idx ON public.broadcast_log (created_at DESC);
CREATE INDEX IF NOT EXISTS broadcast_log_status_idx ON public.broadcast_log (status);

CREATE TABLE IF NOT EXISTS public.newsletter_templates (
  name text PRIMARY KEY,
  subject text NOT NULL,
  body_md text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ADD COLUMN IF NOT EXISTS last_error_at timestamptz;
