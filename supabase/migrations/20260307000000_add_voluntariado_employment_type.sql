-- Add 'voluntariado' (volunteering) to employment_type enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'employment_type' AND e.enumlabel = 'voluntariado'
  ) THEN
    ALTER TYPE public.employment_type ADD VALUE 'voluntariado';
  END IF;
END
$$;
