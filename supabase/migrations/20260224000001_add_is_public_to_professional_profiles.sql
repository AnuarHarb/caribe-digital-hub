-- Add is_public to professional_profiles for profile visibility control.
-- Only public profiles appear in the talent directory and public profile page for non-owners.

ALTER TABLE public.professional_profiles
  ADD COLUMN is_public boolean NOT NULL DEFAULT true;

-- Drop the old policy that allowed anyone to view all profiles
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.professional_profiles;

-- New policy: public profiles visible to all; private profiles visible only to owner
CREATE POLICY "Anyone can view public professional profiles; owners can view own"
  ON public.professional_profiles FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
