-- 020: Admin-editable application forms (Task 3.6)
-- form_definitions: per-entity question schema (programs + get-involved kinds)
-- form_submissions: collected answers keyed by entity type + entity ID

CREATE TABLE IF NOT EXISTS public.form_definitions (
  id          text PRIMARY KEY,
  entity_type text NOT NULL,            -- 'program' | 'member' | 'volunteer' | 'partner' | 'school'
  entity_id   text,                     -- null for get-involved kinds (member/volunteer/partner/school); program id otherwise
  questions   jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS form_definitions_entity_idx
  ON public.form_definitions (entity_type, COALESCE(entity_id, ''));

CREATE TABLE IF NOT EXISTS public.form_submissions (
  id          text PRIMARY KEY,
  entity_type text NOT NULL,
  entity_id   text,
  person_id   text,
  answers     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS form_submissions_entity_idx
  ON public.form_submissions (entity_type, COALESCE(entity_id, ''));
