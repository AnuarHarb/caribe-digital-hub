import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { JobForm } from "@/components/jobs/JobForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";

export default function CreateJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeCompany } = useActiveCompany();

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
    responsibilities?: string;
    skills_tools?: string;
    requirements?: string;
    benefits?: string;
  }) => {
    if (!activeCompany?.id) {
      toast.error(t("dashboard.completeProfileDescription"));
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("job_postings").insert({
        company_id: activeCompany.id,
        title: formData.title,
        description: formData.description,
        location: formData.location || null,
        work_mode: formData.work_mode || null,
        employment_type: formData.employment_type || null,
        salary_min: formData.salary_min ?? null,
        salary_max: formData.salary_max ?? null,
        salary_currency: formData.salary_currency || null,
        status: formData.status as "draft" | "active" | "closed",
        responsibilities: formData.responsibilities || null,
        skills_tools: formData.skills_tools || null,
        requirements: formData.requirements || null,
        benefits: formData.benefits || null,
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

  if (!activeCompany) {
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
            companyId={activeCompany.id}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </article>
  );
}
