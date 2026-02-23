import { useSearchParams } from "react-router-dom";
import { useCompanyJobs } from "@/hooks/useJobs";
import { useJobApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";

export default function ViewApplicants() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { jobs } = useCompanyJobs();
  const effectiveJobId = selectedJobId ?? jobs[0]?.id;
  const { applications, isLoading, updateApplicationStatus, isUpdating } = useJobApplications(effectiveJobId);

  const handleJobChange = (jobId: string) => {
    setSearchParams(jobId ? { job: jobId } : {});
  };

  const selectedJob = jobs.find((j) => j.id === effectiveJobId) ?? jobs[0];

  return (
    <article className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("dashboard.candidates")}
        </h1>
        <p className="text-muted-foreground">
          {t("applications.viewCandidates")}
        </p>
      </header>
      {jobs.length > 0 && (
        <div className="flex items-center gap-4">
          <label htmlFor="job-select" className="text-sm font-medium">
            {t("jobs.title")}:
          </label>
          <Select
            value={selectedJobId ?? jobs[0]?.id ?? ""}
            onValueChange={handleJobChange}
          >
            <SelectTrigger id="job-select" className="w-64">
              <SelectValue placeholder={t("jobs.selectJob")} />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {!selectedJob ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">{t("applications.noJobs")}</p>
            <Link to="/dashboard/empleos/nuevo">
              <Button className="mt-4">{t("dashboard.newJob")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const prof = app.professional_profiles as {
              id?: string;
              title?: string;
              bio?: string;
              location?: string;
              years_experience?: number;
              resume_url?: string;
              profiles?: { full_name?: string; avatar_url?: string };
            } | null;
            const profile = prof?.profiles as { full_name?: string } | undefined;
            return (
              <Card key={app.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{profile?.full_name ?? "-"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{prof?.title ?? "-"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`common.applicationStatus.${app.status}`)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/perfil/${prof?.id}`}>
                      <Button variant="outline" size="sm">
                        {t("landing.featuredTalent.viewProfile")}
                      </Button>
                    </Link>
                    <Select
                      value={app.status}
                      onValueChange={(v) =>
                        updateApplicationStatus({
                          applicationId: app.id,
                          status: v as "pending" | "reviewed" | "interview" | "accepted" | "rejected",
                        })
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">{t("common.applicationStatus.pending")}</SelectItem>
                        <SelectItem value="reviewed">{t("common.applicationStatus.reviewed")}</SelectItem>
                        <SelectItem value="interview">{t("common.applicationStatus.interview")}</SelectItem>
                        <SelectItem value="accepted">{t("common.applicationStatus.accepted")}</SelectItem>
                        <SelectItem value="rejected">{t("common.applicationStatus.rejected")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                {app.cover_letter && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{app.cover_letter}</p>
                  </CardContent>
                )}
              </Card>
            );
          })}
          {applications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-muted-foreground">{t("applications.noCandidates")}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </article>
  );
}
