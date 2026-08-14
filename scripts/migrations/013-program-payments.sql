-- BMAC feature: paid programs + program application payment reference
-- Idempotent — safe to re-apply.

-- Programs table: paid flag + price (kobo-denominated to match paystack amounts)
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS price integer NOT NULL DEFAULT 0;

-- Program applications: optional payment reference for paid program applications
ALTER TABLE public.program_applications
  ADD COLUMN IF NOT EXISTS payment_reference text;
