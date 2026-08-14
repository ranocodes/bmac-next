-- BMAC feature: program operations — applications, cohorts, attendance, donations
-- Idempotent — safe to re-apply.

-- Programs table: add applications_open flag
ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS applications_open boolean NOT NULL DEFAULT false;

-- Program applications
CREATE TABLE IF NOT EXISTS public.program_applications (
  id text PRIMARY KEY,
  program_id text NOT NULL REFERENCES public.programs (id) ON DELETE CASCADE,
  person_id text NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'submitted',
  motivation text NOT NULL DEFAULT '',
  date_of_birth date,
  consent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS program_applications_program_idx ON public.program_applications (program_id, status);
CREATE INDEX IF NOT EXISTS program_applications_person_idx ON public.program_applications (person_id);
CREATE INDEX IF NOT EXISTS program_applications_created_idx ON public.program_applications (created_at DESC);

-- Cohorts
CREATE TABLE IF NOT EXISTS public.cohorts (
  id text PRIMARY KEY,
  program_id text NOT NULL REFERENCES public.programs (id) ON DELETE CASCADE,
  title text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  capacity integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cohorts_program_idx ON public.cohorts (program_id);

-- Participants
CREATE TABLE IF NOT EXISTS public.participants (
  id text PRIMARY KEY,
  cohort_id text NOT NULL REFERENCES public.cohorts (id) ON DELETE CASCADE,
  person_id text NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'enrolled',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, person_id)
);

CREATE INDEX IF NOT EXISTS participants_cohort_idx ON public.participants (cohort_id);
CREATE INDEX IF NOT EXISTS participants_person_idx ON public.participants (person_id);

-- Attendance records
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id text PRIMARY KEY,
  cohort_id text NOT NULL REFERENCES public.cohorts (id) ON DELETE CASCADE,
  person_id text NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  session_date date NOT NULL,
  present boolean NOT NULL DEFAULT false,
  marked_by text NOT NULL,
  marked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cohort_id, person_id, session_date)
);

CREATE INDEX IF NOT EXISTS attendance_records_cohort_idx ON public.attendance_records (cohort_id, session_date);
CREATE INDEX IF NOT EXISTS attendance_records_person_idx ON public.attendance_records (person_id);

-- Donations
CREATE TABLE IF NOT EXISTS public.donations (
  id text PRIMARY KEY,
  person_id text NOT NULL REFERENCES public.people (id) ON DELETE CASCADE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  reference text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  receipt_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS donations_person_idx ON public.donations (person_id);
CREATE INDEX IF NOT EXISTS donations_reference_idx ON public.donations (reference);
CREATE INDEX IF NOT EXISTS donations_status_idx ON public.donations (status);
CREATE INDEX IF NOT EXISTS donations_created_idx ON public.donations (created_at DESC);