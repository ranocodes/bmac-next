-- 021: Create email_campaigns table for campaign/broadcast feature
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id text PRIMARY KEY,
  title text NOT NULL,
  subject text NOT NULL,
  html_body text NOT NULL,
  text_body text,
  target_audience text NOT NULL DEFAULT 'all',
  recipient_count integer DEFAULT 0,
  status text DEFAULT 'draft',
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by text
);
