-- 018: Categories table (events + news)
-- Safe to re-apply. Idempotent insert-on-conflict seed.

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS categories_name_unique ON public.categories (lower(name));

INSERT INTO public.categories (id, name) VALUES
  ('competition', 'Competition'),
  ('workshop', 'Workshop'),
  ('culture', 'Culture'),
  ('mentorship', 'Mentorship'),
  ('community', 'Community'),
  ('partnership', 'Partnership'),
  ('news', 'News'),
  ('announcement', 'Announcement')
ON CONFLICT (id) DO NOTHING;
