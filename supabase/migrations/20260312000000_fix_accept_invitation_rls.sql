-- Fix: Allow invited users to accept invitations.
-- When accepting, the user inserts themselves into company_members, but the existing
-- RLS only allows owners/admins to insert. The invited user is not yet a member.

-- Helper: company IDs where the current user has a pending invitation
CREATE OR REPLACE FUNCTION public.auth_user_pending_invitation_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM public.company_invitations
  WHERE LOWER(invited_email) = LOWER(public.current_user_email())
    AND status = 'pending';
$$;

-- Allow users to insert themselves as members when accepting a pending invitation
CREATE POLICY "User can insert self when accepting invitation"
  ON public.company_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND company_id IN (SELECT public.auth_user_pending_invitation_company_ids())
  );
