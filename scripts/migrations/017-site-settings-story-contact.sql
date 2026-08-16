-- 017: Editable About story + contact info on site_settings
-- Safe to re-apply. Adds jsonb columns with defaults, then backfills the existing row.

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_story jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS contact_info jsonb DEFAULT '{}'::jsonb;

-- Backfill existing settings row only (no-op if already set).
UPDATE public.site_settings SET
  about_story = '{"eyebrow":"Our Story","heading":"From a Local Hub to a National Movement.","paragraphs":["Brilliant Minds Ambassadors Club (BMAC) was founded in Jos, Plateau State by Suleiman Peace Jagaban — a visionary who saw the untapped potential in the youth around him.","What began with five members meeting in a community hall has become a movement of over 350 trained young people. Our ambassadors are now winning regional championships and leading change across Nigeria."]}'::jsonb
WHERE id = (SELECT id FROM public.site_settings LIMIT 1) AND about_story = '{}'::jsonb;

UPDATE public.site_settings SET
  contact_info = '{"email":"hello@bmacjos.org","phone":"+234 803 456 7891","whatsapp":"2348034567891","address":"Nalado Street, Jos","hours":"Mon - Sat: 9am - 5pm"}'::jsonb
WHERE id = (SELECT id FROM public.site_settings LIMIT 1) AND contact_info = '{}'::jsonb;
