-- Add 'solo_founder' to company_size enum (replaces 'startup' in UI)
-- Note: Must be in a separate migration from the UPDATE below, because new enum
-- values must be committed before they can be used.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'company_size' AND e.enumlabel = 'solo_founder'
  ) THEN
    ALTER TYPE public.company_size ADD VALUE 'solo_founder';
  END IF;
END
$$;
