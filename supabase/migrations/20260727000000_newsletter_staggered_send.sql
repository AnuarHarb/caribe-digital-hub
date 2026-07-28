-- Staggered newsletter sends: daily limit, validation filters, batch scheduling

ALTER TABLE public.newsletter_campaigns
  ADD COLUMN IF NOT EXISTS send_mode text NOT NULL DEFAULT 'immediate',
  ADD COLUMN IF NOT EXISTS daily_limit integer,
  ADD COLUMN IF NOT EXISTS validation_filter text NOT NULL DEFAULT 'all_active',
  ADD COLUMN IF NOT EXISTS next_batch_at timestamptz;

DO $$ BEGIN
  ALTER TABLE public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_send_mode_check
    CHECK (send_mode IN ('immediate', 'staggered'));
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_daily_limit_check
    CHECK (daily_limit IS NULL OR daily_limit > 0);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE public.newsletter_campaigns
    ADD CONSTRAINT newsletter_campaigns_validation_filter_check
    CHECK (
      validation_filter IN (
        'all_active',
        'strict_email',
        'has_name',
        'exclude_recent_30d'
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_next_batch
  ON public.newsletter_campaigns (next_batch_at)
  WHERE status = 'sending' AND send_mode = 'staggered';

CREATE INDEX IF NOT EXISTS idx_newsletter_sends_campaign_pending
  ON public.newsletter_sends (campaign_id, created_at)
  WHERE status = 'pending';
