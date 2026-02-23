import { useParams, Link } from "react-router-dom";
import { useJob } from "@/hooks/useJobs";
import { useAuth } from "@/hooks/useAuth";
import { useProfessionalProfile } from "@/hooks/useProfile";
import { useApplyToJob } from "@/hooks/useApplications";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Briefcase, MapPin } from "lucide-react";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { job, isLoading } = useJob(id);
  const { user } = useAuth();
  const { professionalProfile } = useProfessionalProfile();
  const { apply, isApplying } = useApplyToJob();
  const [coverLetter, setCoverLetter] = useState("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const handleApply = async () => {
    if (!job?.id || !professionalProfile?.id) {
      toast.error(t("jobs.needProfile"));
      return;
    }
    try {
      await apply({
        jobId: job.id,
        professionalId: professionalProfile.id,
        coverLetter: coverLetter || undefined,
      });
      toast.success(t("jobs.applySuccess"));
      setApplyDialogOpen(false);
      setCoverLetter("");
    } catch (e) {
      toast.error((e as Error).message?.includes("duplicate") ? t("jobs.alreadyApplied") : t("common.error"));
    }
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const company = job.company_profiles as { company_name?: string; id?: string } | null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <article>
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">{job.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{company?.company_name ?? "-"}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {job.location}
                </span>
              )}
              {job.work_mode && (
                <span>{t(`common.workMode.${job.work_mode}`)}</span>
              )}
              {job.employment_type && (
                <span>{t(`common.employmentType.${job.employment_type}`)}</span>
              )}
            </div>
            {user && professionalProfile ? (
              <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="mt-6">{t("jobs.apply")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("jobs.apply")}</DialogTitle>
                    <DialogDescription>{t("jobs.coverLetterDescription")}</DialogDescription>
                  </DialogHeader>
                  <Textarea
                    placeholder={t("jobs.coverLetterPlaceholder")}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                  />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setApplyDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button onClick={handleApply} disabled={isApplying}>
                      {isApplying ? t("common.loading") : t("jobs.apply")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Link to="/auth?type=professional">
                <Button className="mt-6">{t("jobs.apply")}</Button>
              </Link>
            )}
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("jobs.description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </div>
            </CardContent>
          </Card>

          {job.job_required_skills && (job.job_required_skills as { skill_name: string }[]).length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">{t("jobs.skills")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(job.job_required_skills as { skill_name: string }[]).map((s) => (
                    <span key={s.skill_name} className="rounded-full bg-muted px-3 py-1 text-sm">
                      {s.skill_name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {job.company_id && (
            <div className="mt-6">
              <Link to={`/empresa/${job.company_id}`}>
                <Button variant="outline">{t("company.viewProfile")}</Button>
              </Link>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
