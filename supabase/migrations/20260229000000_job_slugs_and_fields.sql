-- Add slug and structured fields to job_postings

-- New columns
ALTER TABLE public.job_postings
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS responsibilities text,
  ADD COLUMN IF NOT EXISTS skills_tools text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS benefits text;

-- Function to generate URL-friendly slug from title
CREATE OR REPLACE FUNCTION public.generate_job_slug(p_title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  suffix text;
BEGIN
  IF p_title IS NULL OR TRIM(p_title) = '' THEN
    RETURN 'job-' || substr(md5(random()::text), 1, 8);
  END IF;

  -- Lowercase, replace non-alphanumeric with hyphens, collapse multiple hyphens
  base_slug := regexp_replace(
    regexp_replace(lower(trim(p_title)), '[^a-z0-9]+', '-', 'g'),
    '-+', '-', 'g'
  );

  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);

  -- Limit length (leave room for suffix)
  IF length(base_slug) > 60 THEN
    base_slug := left(base_slug, 60);
    base_slug := trim(trailing '-' from base_slug);
  END IF;

  -- Fallback if empty after sanitization
  IF base_slug = '' THEN
    base_slug := 'job';
  END IF;

  -- Append random suffix for uniqueness
  suffix := substr(md5(random()::text), 1, 6);
  final_slug := base_slug || '-' || suffix;

  RETURN final_slug;
END;
$$;

-- Trigger function to set slug on insert/update
CREATE OR REPLACE FUNCTION public.set_job_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.slug IS NULL OR (TG_OP = 'UPDATE' AND OLD.title IS DISTINCT FROM NEW.title) THEN
    NEW.slug := public.generate_job_slug(NEW.title);
    -- Ensure uniqueness (retry with different suffix if collision)
    WHILE EXISTS (SELECT 1 FROM public.job_postings WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug := public.generate_job_slug(NEW.title);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER job_postings_set_slug
  BEFORE INSERT OR UPDATE OF title, slug
  ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_job_slug();

-- Backfill existing rows (use id suffix to guarantee uniqueness)
UPDATE public.job_postings jp
SET slug = (
  COALESCE(
    trim(both '-' from left(
      regexp_replace(regexp_replace(lower(trim(jp.title)), '[^a-z0-9]+', '-', 'g'), '-+', '-', 'g'),
      60
    )),
    'job'
  ) || '-' || substr(jp.id::text, 1, 8)
)
WHERE jp.slug IS NULL;

-- Add NOT NULL and unique index (slug now populated)
ALTER TABLE public.job_postings
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_postings_slug ON public.job_postings(slug);
