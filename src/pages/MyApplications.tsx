import { Link } from "react-router-dom";
import { useMyApplications } from "@/hooks/useApplications";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { FileText } from "lucide-react";

export default function MyApplications() {
  const { t } = useTranslation();
  const { applications, isLoading } = useMyApplications();

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
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.job_postings as { id?: string; slug?: string; title?: string; company_profiles?: { company_name?: string } } | null;
            return (
              <Card key={app.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{job?.title ?? "-"}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {(job?.company_profiles as { company_name?: string })?.company_name ?? "-"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t(`common.applicationStatus.${app.status}`)}
                    </p>
                  </div>
                  {job?.slug && (
                    <Link to={`/empleos/${job.slug}`}>
                      <Button variant="outline" size="sm">
                        {t("landing.featuredJobs.viewJob")}
                      </Button>
                    </Link>
                  )}
                </CardHeader>
              </Card>
            );
          })}
          {applications.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-muted-foreground">{t("applications.empty")}</p>
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
