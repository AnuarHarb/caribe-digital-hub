import { useState } from "react";
import { Link } from "react-router-dom";
import { useMyApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useTranslation } from "react-i18next";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

function CoverLetterCollapsible({
  coverLetter,
  t,
}: {
  coverLetter: string;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          {t("applications.coverLetter")}
          {open ? (
            <ChevronUp className="h-4 w-4" aria-hidden />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <p className="mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
          {coverLetter}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  reviewed: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  interview: "bg-primary/15 text-primary",
  accepted: "bg-green-500/15 text-green-600 dark:text-green-400",
  rejected: "bg-destructive/15 text-destructive",
};

type StatusFilter = "all" | "pending" | "reviewed" | "interview" | "accepted" | "rejected";

export default function MyApplications() {
  const { t } = useTranslation();
  const { applications, isLoading } = useMyApplications();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

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
          {t("dashboard.applications")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.applicationsCount")}
        </p>
      </header>

      {applications.length > 0 && (
        <div className="flex flex-wrap items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger id="status-filter" className="w-48">
              <SelectValue placeholder={t("applications.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("applications.filterAll")}</SelectItem>
              {(
                ["pending", "reviewed", "interview", "accepted", "rejected"] as const
              ).map((status) => (
                <SelectItem key={status} value={status}>
                  {t(`common.applicationStatus.${status}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {applications.length > 0 && (
        <section
          className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3"
          aria-label={t("applications.totalApplications", {
            count: applications.length,
          })}
        >
          <span className="font-medium">
            {t("applications.totalApplications", {
              count: applications.length,
            })}
          </span>
          <div className="flex flex-wrap gap-2">
            {(
              ["pending", "reviewed", "interview", "accepted", "rejected"] as const
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

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
            aria-label={t("common.loading")}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((app) => {
            const job = app.job_postings as {
              id?: string;
              slug?: string;
              title?: string;
              company_profiles?: { company_name?: string };
            } | null;
            const companyName =
              (job?.company_profiles as { company_name?: string })?.company_name ?? "-";
            const statusClass = STATUS_CLASSES[app.status] ?? STATUS_CLASSES.pending;
            return (
              <Card key={app.id}>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-lg">{job?.title ?? "-"}</CardTitle>
                    <p className="text-sm text-muted-foreground">{companyName}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge
                        className={statusClass}
                        variant="outline"
                      >
                        {t(`common.applicationStatus.${app.status}`)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {t("applications.appliedOn", {
                          date: format(new Date(app.created_at ?? ""), "PP"),
                        })}
                      </span>
                    </div>
                  </div>
                  {job?.slug && (
                    <Link to={`/empleos/${job.slug}`} className="shrink-0">
                      <Button variant="outline" size="sm">
                        {t("landing.featuredJobs.viewJob")}
                      </Button>
                    </Link>
                  )}
                </CardHeader>
                {app.cover_letter && (
                  <CardContent className="pt-0">
                    <CoverLetterCollapsible
                      coverLetter={app.cover_letter}
                      t={t}
                    />
                  </CardContent>
                )}
              </Card>
            );
          })}
          {filteredApplications.length === 0 && (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText
                  className="mx-auto h-16 w-16 text-muted-foreground"
                  aria-hidden
                />
                <p className="mt-4 text-lg font-medium text-muted-foreground">
                  {statusFilter === "all"
                    ? t("applications.empty")
                    : t("applications.noApplicationsForStatus")}
                </p>
                <Link to="/empleos">
                  <Button className="mt-4">{t("jobs.browse")}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </article>
  );
}
