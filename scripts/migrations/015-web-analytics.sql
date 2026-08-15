-- BMAC feature: Web analytics — page views + conversion events
-- Idempotent — safe to re-apply.

-- Public site page views (TrackView → POST /api/track)
-- Original insert columns preserved: path, referrer, user_agent, session_id, view_date
CREATE TABLE IF NOT EXISTS public.page_views (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text NOT NULL DEFAULT '',
  user_agent text NOT NULL DEFAULT '',
  session_id text NOT NULL DEFAULT '',
  view_date date NOT NULL DEFAULT CURRENT_DATE,
  utm_source text NOT NULL DEFAULT '',
  utm_medium text NOT NULL DEFAULT '',
  utm_campaign text NOT NULL DEFAULT '',
  device_type text NOT NULL DEFAULT '',
  browser text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Upgrade a pre-existing legacy page_views table (serial id + no utm/device columns)
-- so the new /api/track insert works against existing databases too.
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS utm_source text NOT NULL DEFAULT '';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS utm_medium text NOT NULL DEFAULT '';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS utm_campaign text NOT NULL DEFAULT '';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS device_type text NOT NULL DEFAULT '';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS browser text NOT NULL DEFAULT '';
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS page_views_date_idx
  ON public.page_views (view_date);
CREATE INDEX IF NOT EXISTS page_views_path_date_idx
  ON public.page_views (path, view_date);
CREATE INDEX IF NOT EXISTS page_views_session_idx
  ON public.page_views (session_id);
CREATE INDEX IF NOT EXISTS page_views_referrer_idx
  ON public.page_views (referrer);

-- Business conversion events (server actions + POST /api/track-event)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id text PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  path text NOT NULL DEFAULT '',
  referrer text NOT NULL DEFAULT '',
  utm_source text NOT NULL DEFAULT '',
  utm_medium text NOT NULL DEFAULT '',
  utm_campaign text NOT NULL DEFAULT '',
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_name_date_idx
  ON public.analytics_events (name, created_at);
CREATE INDEX IF NOT EXISTS analytics_events_created_idx
  ON public.analytics_events (created_at);
