-- BMAC feature: clickable admin notifications (deep links to admin pages)
-- Idempotent — safe to re-apply.

ALTER TABLE public.admin_notifications
  ADD COLUMN IF NOT EXISTS link text NOT NULL DEFAULT '';
