-- BMAC feature: event operations — capacity, registration window, tickets
-- Idempotent — safe to re-apply.

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS capacity integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS capacity_used integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registration_deadline text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS max_per_person integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_public_registration boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS reminders_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.event_tickets (
  id text PRIMARY KEY,
  event_id text NOT NULL REFERENCES public.events (id) ON DELETE CASCADE,
  person_id text NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  reference text NOT NULL UNIQUE,
  qr_token text UNIQUE,
  payer_name text NOT NULL DEFAULT '',
  payer_email text NOT NULL DEFAULT '',
  quantity integer NOT NULL DEFAULT 1,
  amount integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  status text NOT NULL DEFAULT 'pending',
  checked_in boolean NOT NULL DEFAULT FALSE,
  checked_in_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  checked_in_at timestamptz
);

CREATE INDEX IF NOT EXISTS event_tickets_event_idx ON public.event_tickets (event_id, status);
CREATE INDEX IF NOT EXISTS event_tickets_person_idx ON public.event_tickets (person_id);
CREATE INDEX IF NOT EXISTS event_tickets_reference_idx ON public.event_tickets (reference);
CREATE INDEX IF NOT EXISTS event_tickets_qr_token_idx ON public.event_tickets (qr_token);
