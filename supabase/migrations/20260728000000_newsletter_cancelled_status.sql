-- Allow cancelling staggered newsletter campaigns and pending sends.

DO $$ BEGIN
  ALTER TYPE public.newsletter_campaign_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TYPE public.newsletter_send_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
