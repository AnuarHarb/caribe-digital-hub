-- Contact interests: stores when a user expresses interest in contacting a talent
-- Used for the "Contactar" button on public talent profiles

CREATE TABLE public.contact_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_profile_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE(requester_id, professional_profile_id)
);

CREATE INDEX idx_contact_interests_talent ON public.contact_interests(professional_profile_id);
CREATE INDEX idx_contact_interests_requester ON public.contact_interests(requester_id);

ALTER TABLE public.contact_interests ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own interest (as requester)
CREATE POLICY "Authenticated can insert own interest"
  ON public.contact_interests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

-- Talent can see who expressed interest; requester can see their own records
CREATE POLICY "Talent and requester can view"
  ON public.contact_interests FOR SELECT
  USING (
    auth.uid() = requester_id
    OR auth.uid() IN (SELECT user_id FROM public.professional_profiles WHERE id = professional_profile_id)
  );
