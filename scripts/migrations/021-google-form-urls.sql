-- Add google_form_url to programs table for external application form redirect
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS google_form_url text DEFAULT '';
