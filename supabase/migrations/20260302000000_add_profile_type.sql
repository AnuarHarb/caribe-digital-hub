-- Add profile_type to company_profiles so the same table serves both companies and communities
-- Also extend account_type to allow 'community' signups

-- 1. New enum for profile type
DO $$ BEGIN
  CREATE TYPE public.profile_type AS ENUM ('company', 'community');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. Add profile_type column (existing rows default to 'company')
ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS profile_type public.profile_type NOT NULL DEFAULT 'company';

-- 3. Extend account_type enum with 'community' value
ALTER TYPE public.account_type ADD VALUE IF NOT EXISTS 'community';

-- 4. Update handle_new_user to also handle community signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  meta_account_type text;
  meta_company_name text;
BEGIN
  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(
      (NEW.raw_user_meta_data->>'account_type')::public.account_type,
      'professional'::public.account_type
    )
  );

  -- Give first user admin role
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  meta_account_type := NEW.raw_user_meta_data->>'account_type';
  meta_company_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), '');

  -- Company signup: create company_profiles with profile_type='company'
  IF meta_account_type = 'company' AND meta_company_name IS NOT NULL THEN
    INSERT INTO public.company_profiles (user_id, company_name, profile_type)
    VALUES (NEW.id, meta_company_name, 'company'::public.profile_type)
    RETURNING id INTO new_company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (new_company_id, NEW.id, 'owner'::public.company_member_role);
  END IF;

  -- Community signup: create company_profiles with profile_type='community'
  IF meta_account_type = 'community' AND meta_company_name IS NOT NULL THEN
    INSERT INTO public.company_profiles (user_id, company_name, profile_type)
    VALUES (NEW.id, meta_company_name, 'community'::public.profile_type)
    RETURNING id INTO new_company_id;

    INSERT INTO public.company_members (company_id, user_id, role)
    VALUES (new_company_id, NEW.id, 'owner'::public.company_member_role);
  END IF;

  RETURN NEW;
END;
$$;
