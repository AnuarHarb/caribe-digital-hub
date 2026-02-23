-- Allow company creators to add themselves as owner when creating a new company.
-- The existing "Owners and admins can insert members" policy requires being already
-- a member, which creates a chicken-and-egg for new companies.

CREATE POLICY "Creators can add themselves as owner"
  ON public.company_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND role = 'owner'
    AND company_id IN (
      SELECT id FROM public.company_profiles WHERE user_id = auth.uid()
    )
  );
