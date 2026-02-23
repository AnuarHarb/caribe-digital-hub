-- Multi-company architecture: company_members, company_invitations, updated RLS

-- Helper to get current user email (auth.users may not be directly accessible in RLS)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid()
$$;

-- Enums
CREATE TYPE public.company_member_role AS ENUM ('owner', 'admin', 'member');
CREATE TYPE public.invitation_status AS ENUM ('pending', 'accepted', 'declined');

-- company_members: many-to-many between users and companies
CREATE TABLE public.company_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.company_member_role NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (company_id, user_id)
);

CREATE INDEX idx_company_members_company_id ON public.company_members(company_id);
CREATE INDEX idx_company_members_user_id ON public.company_members(user_id);

ALTER TABLE public.company_members ENABLE ROW LEVEL SECURITY;

-- company_invitations: pending invites by email
CREATE TABLE public.company_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.company_member_role NOT NULL DEFAULT 'member',
  status public.invitation_status NOT NULL DEFAULT 'pending',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT NOW(),
  expires_at timestamptz DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_company_invitations_company_id ON public.company_invitations(company_id);
CREATE INDEX idx_company_invitations_invited_email ON public.company_invitations(invited_email);
CREATE INDEX idx_company_invitations_token ON public.company_invitations(token);
CREATE INDEX idx_company_invitations_status ON public.company_invitations(status);

ALTER TABLE public.company_invitations ENABLE ROW LEVEL SECURITY;

-- Drop UNIQUE on company_profiles.user_id (user_id becomes "created_by")
ALTER TABLE public.company_profiles DROP CONSTRAINT IF EXISTS company_profiles_user_id_key;

-- Backfill: add owner membership for every existing company
INSERT INTO public.company_members (company_id, user_id, role)
SELECT id, user_id, 'owner'::public.company_member_role
FROM public.company_profiles
ON CONFLICT (company_id, user_id) DO NOTHING;

-- Drop old company_profiles RLS policies
DROP POLICY IF EXISTS "Users can insert own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can delete own company profile" ON public.company_profiles;

-- New company_profiles RLS
CREATE POLICY "Authenticated can insert company profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Members with owner or admin can update company"
  ON public.company_profiles FOR UPDATE
  USING (
    id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Only owners can delete company"
  ON public.company_profiles FOR DELETE
  USING (
    id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Drop old job_postings RLS policies
DROP POLICY IF EXISTS "Anyone can view active job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can insert own job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can update own job postings" ON public.job_postings;
DROP POLICY IF EXISTS "Companies can delete own job postings" ON public.job_postings;

-- New job_postings RLS (members with owner/admin can manage)
CREATE POLICY "Anyone can view active jobs; members see all company jobs"
  ON public.job_postings FOR SELECT
  USING (
    status = 'active'
    OR company_id IN (
      SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members with owner or admin can insert jobs"
  ON public.job_postings FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members with owner or admin can update jobs"
  ON public.job_postings FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Members with owner or admin can delete jobs"
  ON public.job_postings FOR DELETE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- company_members RLS
CREATE POLICY "Members can view company members"
  ON public.company_members FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners and admins can insert members"
  ON public.company_members FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update members"
  ON public.company_members FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can remove members; users can remove self"
  ON public.company_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- company_invitations RLS
CREATE POLICY "Invited user can view own invitations by email"
  ON public.company_invitations FOR SELECT
  USING (
    LOWER(invited_email) = LOWER(public.current_user_email())
    OR company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can create invitations"
  ON public.company_invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update invitations"
  ON public.company_invitations FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM public.company_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Invited user can update (accept/decline) their own invitation
CREATE POLICY "Invited user can update own invitation"
  ON public.company_invitations FOR UPDATE
  USING (LOWER(invited_email) = LOWER(public.current_user_email()));

-- Update handle_new_user: create company + membership when account_type=company and company_name provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  meta_account_type text;
  meta_company_name text;
BEGIN
  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'account_type')::public.account_type,
      'professional'::public.account_type
    )
  );

  -- Give first user admin role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  -- If signup as company with company_name, create company and membership
  meta_account_type := NEW.raw_user_meta_data->>'account_type';
  meta_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), '');

  IF meta_account_type = 'company' AND meta_company_name IS NOT NULL THEN
    INSERT INTO public.company_profiles (user_id, company_name)
    VALUES (NEW.id, meta_company_name)
    RETURNING id INTO new_company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (new_company_id, NEW.id, 'owner'::public.company_member_role);
  END IF;

  RETURN NEW;
END;
$$;
