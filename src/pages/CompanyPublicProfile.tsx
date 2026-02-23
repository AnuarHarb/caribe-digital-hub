import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, ExternalLink } from "lucide-react";

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
        .select("id, title, work_mode, employment_type")
        .eq("company_id", company.id)
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
    enabled: !!company?.id,
  });

  if (isLoading || !company) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Building2 className="h-10 w-10" aria-hidden />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">{company.company_name}</h1>
          {company.industry && (
            <p className="text-muted-foreground">{company.industry}</p>
          )}
          {company.location && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {company.location}
            </p>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex"
            >
              <Button variant="outline" size="sm">
                {t("company.website")} <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </header>

      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("profile.bio")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {jobs && jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("company.openPositions")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {jobs.map((job) => (
              <Link key={job.id} to={`/empleos/${job.id}`}>
                <Button variant="outline" className="w-full justify-start">
                  {job.title}
                  {job.work_mode && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      • {t(`common.workMode.${job.work_mode}`)}
                    </span>
                  )}
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Link to="/talento">
          <Button variant="outline">{t("landing.featuredTalent.viewAll")}</Button>
        </Link>
      </div>
    </article>
      </main>
    </div>
  );
}
