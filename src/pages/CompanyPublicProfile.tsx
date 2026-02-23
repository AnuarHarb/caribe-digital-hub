import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, ExternalLink, Briefcase } from "lucide-react";

type CompanySize = "startup" | "small" | "medium" | "large" | "enterprise";

export default function CompanyPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { data: company, isLoading } = useQuery({
    queryKey: ["company-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("company_profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: jobs } = useQuery({
    queryKey: ["company-jobs", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const { data, error } = await supabase
        .from("job_postings")
        .select("id, slug, title, work_mode, employment_type")
        .eq("company_id", company.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  if (isLoading || !company) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  const companySize = company.company_size as CompanySize | null;
  const sizeLabel = companySize
    ? t(`company.${companySize}`)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <article className="mx-auto max-w-4xl space-y-8">
          {/* Hero banner */}
          <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-muted/60 via-muted/40 to-muted/20 px-6 py-10 md:px-10 md:py-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-8">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-12 w-12 text-muted-foreground" aria-hidden />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-3">
                <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                  {company.company_name}
                </h1>
                {company.industry && (
                  <p className="text-muted-foreground">{company.industry}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {company.location && (
                    <Badge variant="secondary" className="gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {company.location}
                    </Badge>
                  )}
                  {sizeLabel && (
                    <Badge variant="outline">{sizeLabel}</Badge>
                  )}
                </div>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {t("company.website")}
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </header>

          {/* Description section */}
          {company.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("company.aboutUs")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-muted-foreground">
                    {company.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Open positions */}
          <section>
            <h2 className="mb-4 font-display text-xl font-semibold text-foreground">
              {t("company.openPositions")}
            </h2>
            {jobs && jobs.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {jobs.map((job) => (
                  <Link key={job.id} to={`/empleos/${job.slug}`}>
                    <Card className="h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                            <Briefcase className="h-5 w-5" aria-hidden />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base font-semibold leading-tight">
                              {job.title}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-2">
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
                        <span className="mt-3 inline-block text-sm text-primary hover:underline">
                          {t("jobs.browse")} →
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Briefcase className="h-8 w-8 text-muted-foreground" aria-hidden />
                </div>
                <p className="mt-4 font-medium text-muted-foreground">
                  {t("company.noOpenPositions")}
                </p>
              </div>
            )}
          </section>

          <div className="flex justify-center pt-4">
            <Link to="/empleos">
              <Button variant="outline">{t("jobs.browse")}</Button>
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
