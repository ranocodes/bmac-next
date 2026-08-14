-- BMAC feature: persisted workflow queue records + consent capture on people
-- Idempotent — safe to re-apply.

CREATE TABLE IF NOT EXISTS public.workflow_records (
  id text PRIMARY KEY,
  kind text NOT NULL DEFAULT 'contact',
  ref_id text NOT NULL DEFAULT '',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assignee_email text NOT NULL DEFAULT '',
  submitter_name text NOT NULL DEFAULT '',
  submitter_email text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  outcome text NOT NULL DEFAULT '',
  last_contacted_at timestamptz,
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS workflow_records_status_idx ON public.workflow_records (status);
CREATE INDEX IF NOT EXISTS workflow_records_kind_status_idx ON public.workflow_records (kind, status);
CREATE INDEX IF NOT EXISTS workflow_records_created_idx ON public.workflow_records (created_at DESC);

ALTER TABLE public.people
  ADD COLUMN IF NOT EXISTS consent jsonb NOT NULL DEFAULT '{}'::jsonb;
