import { useNavigate, useParams } from "react-router-dom";
import { JobForm } from "@/components/jobs/JobForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useState } from "react";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { useCompanyJobs } from "@/hooks/useJobs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function EditJob() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { activeCompany } = useActiveCompany();
  const { jobs, updateJob } = useCompanyJobs();

  const job = jobs.find((j) => j.id === id);

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
    if (!id || !activeCompany?.id) {
      toast.error(t("dashboard.completeProfileDescription"));
      return;
    }
    setIsSubmitting(true);
    try {
      await updateJob({
        id,
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
      toast.success(t("common.success"));
      navigate("/dashboard/empleos");
    } catch {
      toast.error(t("common.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManage = activeCompany?.role === "owner" || activeCompany?.role === "admin";

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

  if (!canManage) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("company.noPermissionEditJobs")}
        </CardContent>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {t("jobs.notFound")}
        </CardContent>
      </Card>
    );
  }

  return (
    <article>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/empleos" className="gap-2">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {t("dashboard.manageJobs")}
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t("jobs.editJob")}</CardTitle>
          <CardDescription>
            {t("jobs.editDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobForm
            companyId={activeCompany.id}
            defaultValues={{
              title: job.title,
              description: job.description ?? "",
              location: job.location ?? "",
              work_mode: job.work_mode ?? undefined,
              employment_type: job.employment_type ?? undefined,
              salary_min: job.salary_min ?? undefined,
              salary_max: job.salary_max ?? undefined,
              salary_currency: job.salary_currency ?? "USD",
              status: job.status,
              responsibilities: job.responsibilities ?? "",
              skills_tools: job.skills_tools ?? "",
              requirements: job.requirements ?? "",
              benefits: job.benefits ?? "",
            }}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </article>
  );
}
