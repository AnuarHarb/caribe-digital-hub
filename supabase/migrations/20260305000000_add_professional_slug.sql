-- Add slug to professional_profiles for human-readable public profile URLs
-- Slug is derived from full_name (profiles); if taken, append -2, -3, etc.

ALTER TABLE public.professional_profiles
  ADD COLUMN IF NOT EXISTS slug text;

-- Function to generate URL-friendly slug from name
CREATE OR REPLACE FUNCTION public.slug_from_name(p_name text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  base_slug text;
BEGIN
  IF p_name IS NULL OR TRIM(p_name) = '' THEN
    RETURN 'perfil';
  END IF;

  -- Lowercase, replace non-alphanumeric with hyphens, collapse multiple hyphens
  base_slug := regexp_replace(
    regexp_replace(lower(trim(p_name)), '[^a-z0-9áéíóúñ]+', '-', 'g'),
    '-+', '-', 'g'
  );

  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);

  -- Limit length
  IF length(base_slug) > 60 THEN
    base_slug := left(base_slug, 60);
    base_slug := trim(trailing '-' from base_slug);
  END IF;

  IF base_slug = '' THEN
    RETURN 'perfil';
  END IF;

  RETURN base_slug;
END;
$$;

-- Function to get next available slug (base or base-2, base-3, ...)
CREATE OR REPLACE FUNCTION public.ensure_unique_profile_slug(
  p_base_slug text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
  n int := 0;
BEGIN
  candidate := p_base_slug;

  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.professional_profiles
      WHERE slug = candidate
        AND (p_exclude_id IS NULL OR id != p_exclude_id)
    ) THEN
      RETURN candidate;
    END IF;

    n := n + 1;
    candidate := p_base_slug || '-' || n::text;
  END LOOP;
END;
$$;

-- Trigger: set slug on professional_profiles insert/update
CREATE OR REPLACE FUNCTION public.set_professional_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_name text;
  v_base_slug text;
BEGIN
  SELECT full_name INTO v_name FROM public.profiles WHERE id = NEW.user_id;

  v_base_slug := public.slug_from_name(v_name);
  NEW.slug := public.ensure_unique_profile_slug(v_base_slug, NEW.id);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS professional_profiles_set_slug ON public.professional_profiles;
CREATE TRIGGER professional_profiles_set_slug
  BEFORE INSERT OR UPDATE OF user_id
  ON public.professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_professional_slug();

-- Trigger: when profiles.full_name changes, update professional_profiles.slug
CREATE OR REPLACE FUNCTION public.sync_professional_slug_on_name_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_prof_id uuid;
  v_base_slug text;
  v_new_slug text;
BEGIN
  IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
    SELECT id INTO v_prof_id FROM public.professional_profiles WHERE user_id = NEW.id LIMIT 1;
    IF v_prof_id IS NOT NULL THEN
      v_base_slug := public.slug_from_name(NEW.full_name);
      v_new_slug := public.ensure_unique_profile_slug(v_base_slug, v_prof_id);

      UPDATE public.professional_profiles
      SET slug = v_new_slug
      WHERE id = v_prof_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_sync_professional_slug ON public.profiles;
CREATE TRIGGER profiles_sync_professional_slug
  AFTER UPDATE OF full_name
  ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_professional_slug_on_name_change();

-- Backfill existing rows
UPDATE public.professional_profiles pp
SET slug = public.ensure_unique_profile_slug(
  public.slug_from_name(p.full_name),
  pp.id
)
FROM public.profiles p
WHERE pp.user_id = p.id
  AND pp.slug IS NULL;

-- For any still null (orphaned?), use id suffix
UPDATE public.professional_profiles
SET slug = 'perfil-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

ALTER TABLE public.professional_profiles
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_professional_profiles_slug ON public.professional_profiles(slug);
