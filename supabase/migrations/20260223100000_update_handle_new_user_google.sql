-- Update handle_new_user to support Google OAuth and other providers
-- - Default account_type to 'professional' when not provided (e.g. Google sign-in)
-- - Extract avatar_url from provider metadata (Google provides avatar_url, picture)
-- - Handle full_name from various provider formats (full_name, name)
-- - ON CONFLICT: update avatar_url if the profile already exists (e.g. email user links Google)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name TEXT;
  v_avatar_url TEXT;
  v_account_type public.account_type;
BEGIN
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );
  v_avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );
  v_account_type := COALESCE(
    (NEW.raw_user_meta_data->>'account_type')::public.account_type,
    'professional'
  );

  INSERT INTO public.profiles (id, full_name, account_type, avatar_url)
  VALUES (NEW.id, v_full_name, v_account_type, NULLIF(v_avatar_url, ''))
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), profiles.avatar_url),
    full_name = CASE
      WHEN profiles.full_name IS NULL OR profiles.full_name = ''
      THEN EXCLUDED.full_name
      ELSE profiles.full_name
    END;

  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = NEW.id) THEN
    IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'admin');
    ELSE
      INSERT INTO public.user_roles (user_id, role)
      VALUES (NEW.id, 'user');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
