import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase } from "lucide-react";

export function FeaturedJobs() {
  const { t } = useTranslation();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["featured-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_postings")
        .select(`
          id,
          title,
          location,
          work_mode,
          employment_type,
          company_profiles(company_name)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section
      aria-labelledby="featured-jobs-heading"
      className="py-20 md:py-28 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        <h2
          id="featured-jobs-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.featuredJobs.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.featuredJobs.subtitle")}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="mt-4 h-9 w-full" />
                </CardContent>
              </Card>
            ))
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job) => (
              <Card
                key={job.id}
                className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                      <Briefcase className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {job.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {(job.company_profiles as { company_name?: string })
                          ?.company_name ?? "-"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.location && (
                      <span className="text-xs text-muted-foreground">
                        {job.location}
                      </span>
                    )}
                    {job.work_mode && (
                      <Badge variant="secondary" className="text-xs">
                        {t(`common.workMode.${job.work_mode}`)}
                      </Badge>
                    )}
                    {job.employment_type && (
                      <Badge variant="outline" className="text-xs">
                        {t(`common.employmentType.${job.employment_type}`)}
                      </Badge>
                    )}
                  </div>
                  <Link to={`/empleos/${job.id}`} className="mt-4 block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full transition-colors"
                    >
                      {t("landing.featuredJobs.viewJob")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-muted-foreground">
                {t("landing.featuredJobs.empty")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("landing.featuredJobs.emptyInvite")}
              </p>
              <Link to="/auth?type=company" className="mt-6">
                <Button>{t("landing.hero.ctaCompany")}</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link to="/empleos">
            <Button variant="outline" className="transition-colors">
              {t("landing.featuredJobs.viewAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
