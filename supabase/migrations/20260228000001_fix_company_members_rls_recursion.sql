-- Fix infinite recursion in company_members RLS policies.
-- Policies that SELECT from company_members trigger the same table's policies, causing recursion.
-- Use SECURITY DEFINER functions to bypass RLS when checking membership.

-- Helper: company IDs where the current user is a member (any role)
CREATE OR REPLACE FUNCTION public.auth_user_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members WHERE user_id = auth.uid()
$$;

-- Helper: company IDs where the current user is owner or admin
CREATE OR REPLACE FUNCTION public.auth_user_managed_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
$$;

-- Helper: company IDs where the current user is owner
CREATE OR REPLACE FUNCTION public.auth_user_owned_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.company_members
  WHERE user_id = auth.uid() AND role = 'owner'
$$;

-- Drop and recreate company_members policies using helpers (no self-reference)
DROP POLICY IF EXISTS "Members can view company members" ON public.company_members;
CREATE POLICY "Members can view company members"
  ON public.company_members FOR SELECT
  USING (company_id IN (SELECT public.auth_user_company_ids()));

DROP POLICY IF EXISTS "Owners and admins can insert members" ON public.company_members;
CREATE POLICY "Owners and admins can insert members"
  ON public.company_members FOR INSERT
  WITH CHECK (company_id IN (SELECT public.auth_user_managed_company_ids()));

DROP POLICY IF EXISTS "Owners and admins can update members" ON public.company_members;
CREATE POLICY "Owners and admins can update members"
  ON public.company_members FOR UPDATE
  USING (company_id IN (SELECT public.auth_user_managed_company_ids()));

DROP POLICY IF EXISTS "Owners can remove members; users can remove self" ON public.company_members;
CREATE POLICY "Owners can remove members; users can remove self"
  ON public.company_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR company_id IN (SELECT public.auth_user_owned_company_ids())
  );

-- Fix company_invitations policies (they also reference company_members)
DROP POLICY IF EXISTS "Invited user can view own invitations by email" ON public.company_invitations;
CREATE POLICY "Invited user can view own invitations by email"
  ON public.company_invitations FOR SELECT
  USING (
    LOWER(invited_email) = LOWER(public.current_user_email())
    OR company_id IN (SELECT public.auth_user_managed_company_ids())
  );

DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.company_invitations;
CREATE POLICY "Owners and admins can create invitations"
  ON public.company_invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND company_id IN (SELECT public.auth_user_managed_company_ids())
  );

DROP POLICY IF EXISTS "Owners and admins can update invitations" ON public.company_invitations;
CREATE POLICY "Owners and admins can update invitations"
  ON public.company_invitations FOR UPDATE
  USING (company_id IN (SELECT public.auth_user_managed_company_ids()));
