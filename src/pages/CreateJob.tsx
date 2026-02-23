import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { JobForm } from "@/components/jobs/JobForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";

export default function CreateJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: companyProfile } = useQuery({
    queryKey: ["company-profile-for-create"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("company_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (formData: {
    title: string;
    description: string;
    location?: string;
    work_mode?: string;
    employment_type?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    status: string;
  }) => {
    if (!companyProfile?.id) {
      toast.error(t("dashboard.completeProfileDescription"));
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("job_postings").insert({
        company_id: companyProfile.id,
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        work_mode: formData.work_mode || null,
        employment_type: formData.employment_type || null,
        salary_min: formData.salary_min ?? null,
        salary_max: formData.salary_max ?? null,
        salary_currency: formData.salary_currency || null,
        status: formData.status as "draft" | "active" | "closed",
      });
      if (error) throw error;
      toast.success(t("common.success"));
      navigate("/dashboard/empleos");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!companyProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.completeProfile")}</CardTitle>
          <CardDescription>{t("dashboard.completeProfileDescription")}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <article>
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.newJob")}</CardTitle>
          <CardDescription>
            {t("jobs.createDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm
            companyId={companyProfile.id}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </article>
  );
}
