-- Update job_applications RLS to use company_members instead of company_profiles.user_id.
-- This allows all company members to view applications; only owners/admins can update status.

DROP POLICY IF EXISTS "Companies can view applications to their jobs" ON public.job_applications;
CREATE POLICY "Companies can view applications to their jobs"
  ON public.job_applications FOR SELECT
  USING (
    job_id IN (
      SELECT jp.id FROM public.job_postings jp
      WHERE jp.company_id IN (SELECT public.auth_user_company_ids())
    )
  );

DROP POLICY IF EXISTS "Companies can update application status for their jobs" ON public.job_applications;
CREATE POLICY "Companies can update application status for their jobs"
  ON public.job_applications FOR UPDATE
  USING (
    job_id IN (
      SELECT jp.id FROM public.job_postings jp
      WHERE jp.company_id IN (SELECT public.auth_user_managed_company_ids())
    )
  );
