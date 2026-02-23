-- Talent Network Schema Migration
-- Extends existing profiles and adds professional/company tables
-- Creates base schema (profiles, user_roles, events) if not exists for fresh projects

-- =============================================================================
-- BASE SCHEMA (creates if not exists for fresh Supabase projects)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  registration_link TEXT,
  description TEXT,
  image_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TALENT NETWORK ENUMS
-- =============================================================================

DO $$ BEGIN CREATE TYPE public.account_type AS ENUM ('professional', 'company'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.availability_status AS ENUM ('available', 'open_to_offers', 'not_looking'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.work_mode AS ENUM ('remote', 'hybrid', 'onsite'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.employment_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.job_status AS ENUM ('draft', 'active', 'closed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.application_status AS ENUM ('pending', 'reviewed', 'interview', 'accepted', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.company_size AS ENUM ('startup', 'small', 'medium', 'large', 'enterprise'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- =============================================================================
-- ALTER PROFILES
-- =============================================================================

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS account_type account_type,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT NOW();

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- PROFESSIONAL PROFILES
-- =============================================================================

CREATE TABLE public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  title text,
  bio text,
  location text,
  years_experience integer,
  availability availability_status DEFAULT 'open_to_offers',
  linkedin_url text,
  github_url text,
  portfolio_url text,
  resume_url text,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_professional_profiles_user_id ON public.professional_profiles(user_id);
CREATE INDEX idx_professional_profiles_availability ON public.professional_profiles(availability);
CREATE INDEX idx_professional_profiles_location ON public.professional_profiles(location);
CREATE INDEX idx_professional_profiles_years_experience ON public.professional_profiles(years_experience);

ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional profiles"
  ON public.professional_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own professional profile"
  ON public.professional_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own professional profile"
  ON public.professional_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own professional profile"
  ON public.professional_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_professional_profiles_updated_at
  BEFORE UPDATE ON public.professional_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- PROFESSIONAL SKILLS
-- =============================================================================

CREATE TABLE public.professional_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  skill_level skill_level DEFAULT 'intermediate',
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (professional_id, skill_name)
);

CREATE INDEX idx_professional_skills_professional_id ON public.professional_skills(professional_id);
CREATE INDEX idx_professional_skills_skill_name ON public.professional_skills(skill_name);

ALTER TABLE public.professional_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional skills"
  ON public.professional_skills FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage own skills"
  ON public.professional_skills FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PROFESSIONAL EXPERIENCE
-- =============================================================================

CREATE TABLE public.professional_experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_professional_experience_professional_id ON public.professional_experience(professional_id);

ALTER TABLE public.professional_experience ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional experience"
  ON public.professional_experience FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage own experience"
  ON public.professional_experience FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- PROFESSIONAL EDUCATION
-- =============================================================================

CREATE TABLE public.professional_education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  institution text NOT NULL,
  degree text,
  field_of_study text,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_professional_education_professional_id ON public.professional_education(professional_id);

ALTER TABLE public.professional_education ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional education"
  ON public.professional_education FOR SELECT
  USING (true);

CREATE POLICY "Professionals can manage own education"
  ON public.professional_education FOR ALL
  USING (
    professional_id IN (
      SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- COMPANY PROFILES
-- =============================================================================

CREATE TABLE public.company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  description text,
  industry text,
  website text,
  logo_url text,
  location text,
  company_size company_size,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_company_profiles_user_id ON public.company_profiles(user_id);
CREATE INDEX idx_company_profiles_industry ON public.company_profiles(industry);
CREATE INDEX idx_company_profiles_location ON public.company_profiles(location);

ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company profiles"
  ON public.company_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own company profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON public.company_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON public.company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- JOB POSTINGS
-- =============================================================================

CREATE TABLE public.job_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.company_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  location text,
  work_mode work_mode,
  employment_type employment_type,
  salary_min integer,
  salary_max integer,
  salary_currency text DEFAULT 'USD',
  status job_status DEFAULT 'draft',
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

CREATE INDEX idx_job_postings_company_id ON public.job_postings(company_id);
CREATE INDEX idx_job_postings_status ON public.job_postings(status);
CREATE INDEX idx_job_postings_work_mode ON public.job_postings(work_mode);
CREATE INDEX idx_job_postings_employment_type ON public.job_postings(employment_type);
CREATE INDEX idx_job_postings_created_at ON public.job_postings(created_at DESC);
CREATE INDEX idx_job_postings_expires_at ON public.job_postings(expires_at) WHERE status = 'active';

ALTER TABLE public.job_postings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active job postings"
  ON public.job_postings FOR SELECT
  USING (
    status = 'active' OR
    company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can insert own job postings"
  ON public.job_postings FOR INSERT
  WITH CHECK (
    company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can update own job postings"
  ON public.job_postings FOR UPDATE
  USING (
    company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can delete own job postings"
  ON public.job_postings FOR DELETE
  USING (
    company_id IN (SELECT id FROM public.company_profiles WHERE user_id = auth.uid())
  );

CREATE TRIGGER update_job_postings_updated_at
  BEFORE UPDATE ON public.job_postings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- JOB REQUIRED SKILLS
-- =============================================================================

CREATE TABLE public.job_required_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  is_required boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW(),
  UNIQUE (job_id, skill_name)
);

CREATE INDEX idx_job_required_skills_job_id ON public.job_required_skills(job_id);
CREATE INDEX idx_job_required_skills_skill_name ON public.job_required_skills(skill_name);

ALTER TABLE public.job_required_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view job required skills"
  ON public.job_required_skills FOR SELECT
  USING (true);

CREATE POLICY "Companies can manage skills for own jobs"
  ON public.job_required_skills FOR ALL
  USING (
    job_id IN (
      SELECT jp.id FROM public.job_postings jp
      JOIN public.company_profiles cp ON jp.company_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

-- =============================================================================
-- JOB APPLICATIONS
-- =============================================================================

CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_postings(id) ON DELETE CASCADE,
  professional_id uuid NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  cover_letter text,
  status application_status DEFAULT 'pending',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW(),
  UNIQUE (job_id, professional_id)
);

CREATE INDEX idx_job_applications_job_id ON public.job_applications(job_id);
CREATE INDEX idx_job_applications_professional_id ON public.job_applications(professional_id);
CREATE INDEX idx_job_applications_status ON public.job_applications(status);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view own applications"
  ON public.job_applications FOR SELECT
  USING (
    professional_id IN (
      SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can view applications to their jobs"
  ON public.job_applications FOR SELECT
  USING (
    job_id IN (
      SELECT jp.id FROM public.job_postings jp
      JOIN public.company_profiles cp ON jp.company_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Professionals can insert own applications"
  ON public.job_applications FOR INSERT
  WITH CHECK (
    professional_id IN (
      SELECT id FROM public.professional_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Companies can update application status for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    job_id IN (
      SELECT jp.id FROM public.job_postings jp
      JOIN public.company_profiles cp ON jp.company_id = cp.id
      WHERE cp.user_id = auth.uid()
    )
  );

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
-- Create buckets via Supabase Storage API or Dashboard if not exists.
-- Recommended: Create 'avatars' (public) and 'resumes' (private) buckets manually.
-- File paths: avatars/{user_id}/avatar.jpg, resumes/{user_id}/resume.pdf
