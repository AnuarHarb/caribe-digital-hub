-- Costa Digital News newsletter: subscribers, campaigns, and per-recipient sends (Resend)

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.newsletter_subscriber_status AS ENUM ('active', 'unsubscribed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.newsletter_campaign_status AS ENUM ('draft', 'sending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.newsletter_send_status AS ENUM ('pending', 'sent', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- TABLE newsletter_subscribers
-- =============================================================================

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  name text,
  status public.newsletter_subscriber_status NOT NULL DEFAULT 'active',
  source text NOT NULL DEFAULT 'web',
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  unsubscribed_at timestamptz,
  CONSTRAINT newsletter_subscribers_email_unique UNIQUE (email),
  CONSTRAINT newsletter_subscribers_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE INDEX idx_newsletter_subscribers_status ON public.newsletter_subscribers(status);
CREATE INDEX idx_newsletter_subscribers_created_at ON public.newsletter_subscribers(created_at DESC);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can select newsletter subscribers"
  ON public.newsletter_subscribers FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can insert newsletter subscribers"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can update newsletter subscribers"
  ON public.newsletter_subscribers FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete newsletter subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can delete newsletter subscribers"
  ON public.newsletter_subscribers FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON public.newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON public.newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- TABLE newsletter_campaigns
-- =============================================================================

CREATE TABLE public.newsletter_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  html_body text NOT NULL,
  status public.newsletter_campaign_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  recipient_count integer NOT NULL DEFAULT 0,
  sent_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newsletter_campaigns_created_at ON public.newsletter_campaigns(created_at DESC);
CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);

ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select newsletter campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can select newsletter campaigns"
  ON public.newsletter_campaigns FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert newsletter campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can insert newsletter campaigns"
  ON public.newsletter_campaigns FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update newsletter campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can update newsletter campaigns"
  ON public.newsletter_campaigns FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete newsletter campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can delete newsletter campaigns"
  ON public.newsletter_campaigns FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS update_newsletter_campaigns_updated_at ON public.newsletter_campaigns;
CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON public.newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- TABLE newsletter_sends
-- =============================================================================

CREATE TABLE public.newsletter_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.newsletter_campaigns(id) ON DELETE CASCADE,
  subscriber_id uuid REFERENCES public.newsletter_subscribers(id) ON DELETE SET NULL,
  email text NOT NULL,
  resend_id text,
  status public.newsletter_send_status NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_newsletter_sends_campaign_id ON public.newsletter_sends(campaign_id);
CREATE INDEX idx_newsletter_sends_email ON public.newsletter_sends(email);
CREATE INDEX idx_newsletter_sends_status ON public.newsletter_sends(status);
CREATE INDEX idx_newsletter_sends_created_at ON public.newsletter_sends(created_at DESC);

ALTER TABLE public.newsletter_sends ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can select newsletter sends" ON public.newsletter_sends;
CREATE POLICY "Admins can select newsletter sends"
  ON public.newsletter_sends FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can insert newsletter sends" ON public.newsletter_sends;
CREATE POLICY "Admins can insert newsletter sends"
  ON public.newsletter_sends FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update newsletter sends" ON public.newsletter_sends;
CREATE POLICY "Admins can update newsletter sends"
  ON public.newsletter_sends FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
