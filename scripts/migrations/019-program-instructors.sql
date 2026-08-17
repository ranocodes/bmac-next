-- 019: Multi-instructor support for programs
-- Adds instructors jsonb array. Backfills from legacy single-instructor columns.

ALTER TABLE public.programs
  ADD COLUMN IF NOT EXISTS instructors jsonb DEFAULT '[]'::jsonb;

-- Backfill: if instructor_name is set, create one instructor entry
UPDATE public.programs
SET instructors = jsonb_build_array(
  jsonb_build_object(
    'name', COALESCE(NULLIF(instructor_name, ''), ''),
    'bio',  COALESCE(NULLIF(instructor_bio,  ''), ''),
    'photo', CASE WHEN instructor_photo IS NOT NULL AND instructor_photo != '' THEN instructor_photo ELSE NULL END
  )
)
WHERE instructors = '[]'::jsonb
  AND instructor_name IS NOT NULL
  AND instructor_name != '';
