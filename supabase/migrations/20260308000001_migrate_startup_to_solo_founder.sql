-- Migrate existing 'startup' to 'solo_founder'
-- Must run after 20260308000000 which adds the enum value (new values must be committed first).
UPDATE public.company_profiles
SET company_size = 'solo_founder'
WHERE company_size = 'startup';
