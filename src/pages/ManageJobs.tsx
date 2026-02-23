import { Link } from "react-router-dom";
import { useCompanyJobs } from "@/hooks/useJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Briefcase, Plus } from "lucide-react";

export default function ManageJobs() {
  const { t } = useTranslation();
  const { jobs, isLoading } = useCompanyJobs();

  return (
    <article className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-primary">
          {t("dashboard.jobs")}
        </h1>
        <Link to="/dashboard/empleos/nuevo">
          <Button>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            {t("dashboard.newJob")}
          </Button>
        </Link>
      </header>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {job.status === "draft" ? t("jobs.statusDraft") : job.status === "active" ? t("jobs.statusActive") : t("jobs.statusClosed")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={`/dashboard/candidatos?job=${job.id}`}>
                    <Button variant="outline" size="sm">
                      {t("dashboard.candidates")}
                    </Button>
                  </Link>
                  <Link to={`/empleos/${job.slug}`}>
                    <Button variant="ghost" size="sm">
                      {t("landing.featuredJobs.viewJob")}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
            </Card>
          ))}
          {jobs.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-muted-foreground">{t("landing.featuredJobs.empty")}</p>
                <Link to="/dashboard/empleos/nuevo">
                  <Button className="mt-4">{t("dashboard.newJob")}</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </article>
  );
}
