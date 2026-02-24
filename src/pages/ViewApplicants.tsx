import { useSearchParams } from "react-router-dom";
import { useCompanyJobs } from "@/hooks/useJobs";
import { useJobApplications, useCompanyApplicationCounts } from "@/hooks/useApplications";
import { useActiveCompany } from "@/contexts/ActiveCompanyContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  interview: "bg-primary/15 text-primary",
  accepted: "bg-green-500/15 text-green-600 dark:text-green-400",
  rejected: "bg-destructive/15 text-destructive",
};

function getInitials(name: string | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function ViewApplicants() {
  const { t } = useTranslation();
  const { activeCompany } = useActiveCompany();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobId = searchParams.get("job") ?? undefined;
  const { jobs } = useCompanyJobs();
  const effectiveJobId = selectedJobId ?? jobs[0]?.id;
  const { applications, isLoading, updateApplicationStatus, isUpdating } =
    useJobApplications(effectiveJobId);
  const counts = useCompanyApplicationCounts(jobs.map((j) => j.id));

  const canManage =
    activeCompany?.role === "owner" || activeCompany?.role === "admin";

  const handleJobChange = (jobId: string) => {
    setSearchParams(jobId ? { job: jobId } : {});
  };

  const selectedJob = jobs.find((j) => j.id === effectiveJobId) ?? jobs[0];

  const statusCounts = applications.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <div className="flex flex-wrap items-center gap-4">
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
              {jobs.map((job) => {
                const count = counts[job.id] ?? 0;
                return (
                  <SelectItem key={job.id} value={job.id}>
                    {job.title} ({count})
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
      {!selectedJob ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users
              className="mx-auto h-12 w-12 text-muted-foreground"
              aria-hidden
            />
            <p className="mt-4 text-muted-foreground">
              {t("applications.noJobs")}
            </p>
            <Link to="/dashboard/empleos/nuevo">
              <Button className="mt-4">{t("dashboard.newJob")}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-label={t("common.loading")}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {applications.length > 0 && (
            <section
              className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3"
              aria-label={t("applications.totalCandidates", {
                count: applications.length,
              })}
            >
              <span className="font-medium">
                {t("applications.totalCandidates", {
                  count: applications.length,
                })}
              </span>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "pending",
                    "reviewed",
                    "interview",
                    "accepted",
                    "rejected",
                  ] as const
                ).map((status) => {
                  const n = statusCounts[status] ?? 0;
                  if (n === 0) return null;
                  return (
                    <Badge key={status} variant="secondary" className="text-xs">
                      {t(`common.applicationStatus.${status}`)}: {n}
                    </Badge>
                  );
                })}
              </div>
            </section>
          )}
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
              const profile = prof?.profiles as
                | { full_name?: string; avatar_url?: string }
                | undefined;
              const name = profile?.full_name ?? "-";
              return (
                <CandidateCard
                  key={app.id}
                  application={app}
                  professionalId={prof?.id}
                  name={name}
                  avatarUrl={profile?.avatar_url}
                  title={prof?.title}
                  location={prof?.location}
                  yearsExperience={prof?.years_experience}
                  coverLetter={app.cover_letter}
                  canManage={canManage}
                  isUpdating={isUpdating}
                  onStatusChange={(status) =>
                    updateApplicationStatus({
                      applicationId: app.id,
                      status,
                    })
                  }
                  t={t}
                />
              );
            })}
            {applications.length === 0 && (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users
                    className="mx-auto h-16 w-16 text-muted-foreground"
                    aria-hidden
                  />
                  <p className="mt-4 text-lg font-medium text-muted-foreground">
                    {t("applications.noCandidates")}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("applications.noJobs")}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

type CandidateCardProps = {
  application: {
    id: string;
    status: string;
    created_at: string;
  };
  professionalId?: string;
  name: string;
  avatarUrl?: string | null;
  title?: string | null;
  location?: string | null;
  yearsExperience?: number | null;
  coverLetter?: string | null;
  canManage: boolean;
  isUpdating: boolean;
  onStatusChange: (
    status: "pending" | "reviewed" | "interview" | "accepted" | "rejected"
  ) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
};

function CandidateCard({
  application,
  professionalId,
  name,
  avatarUrl,
  title,
  location,
  yearsExperience,
  coverLetter,
  canManage,
  isUpdating,
  onStatusChange,
  t,
}: CandidateCardProps) {
  const [coverOpen, setCoverOpen] = useState(false);
  const statusClass = STATUS_CLASSES[application.status] ?? STATUS_CLASSES.pending;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            {title && (
              <p className="text-sm text-muted-foreground">{title}</p>
            )}
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {location && <span>{location}</span>}
              {yearsExperience != null && (
                <span>
                  {t("applications.experience", { years: yearsExperience })}
                </span>
              )}
              <span>
                {t("applications.appliedOn", {
                  date: format(new Date(application.created_at), "PP"),
                })}
              </span>
            </div>
            <Badge
              className={`mt-2 ${statusClass}`}
              variant="outline"
            >
              {t(`common.applicationStatus.${application.status}`)}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {professionalId && (
            <Link to={`/perfil/${professionalId}`}>
              <Button variant="outline" size="sm">
                {t("landing.featuredTalent.viewProfile")}
              </Button>
            </Link>
          )}
          {canManage && (
            <Select
              value={application.status}
              onValueChange={(v) =>
                onStatusChange(
                  v as
                    | "pending"
                    | "reviewed"
                    | "interview"
                    | "accepted"
                    | "rejected"
                )
              }
              disabled={isUpdating}
            >
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  {t("common.applicationStatus.pending")}
                </SelectItem>
                <SelectItem value="reviewed">
                  {t("common.applicationStatus.reviewed")}
                </SelectItem>
                <SelectItem value="interview">
                  {t("common.applicationStatus.interview")}
                </SelectItem>
                <SelectItem value="accepted">
                  {t("common.applicationStatus.accepted")}
                </SelectItem>
                <SelectItem value="rejected">
                  {t("common.applicationStatus.rejected")}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      {coverLetter && (
        <CardContent className="pt-0">
          <Collapsible open={coverOpen} onOpenChange={setCoverOpen}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                {t("applications.coverLetter")}
                {coverOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                {coverLetter}
              </p>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      )}
    </Card>
  );
}
