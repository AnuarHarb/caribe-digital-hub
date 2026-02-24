import { useParams, Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { User, MapPin, Briefcase, GraduationCap, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useContactInterest } from "@/hooks/useContactInterest";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { expressInterest, isSubmitting, isAuthenticated } = useContactInterest();

  // Query only fetches professional info; contact data (phone, email, address) is intentionally excluded
  const { data: professional, isLoading, isError } = useQuery({
    queryKey: ["professional-profile", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("professional_profiles")
        .select(`
          *,
          professional_skills(skill_name, skill_level),
          professional_experience(*),
          professional_education(*),
          profiles(full_name, avatar_url)
        `)
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // RLS blocks private profiles for non-owners; show private message (also covers not-found)
  if (isError || !professional) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-3xl rounded-lg border bg-card p-8 text-center">
            <p className="text-muted-foreground">{t("profile.privateProfile")}</p>
          </div>
        </main>
      </div>
    );
  }

  const profile = professional.profiles as { full_name?: string; avatar_url?: string } | null;
  const fullName = profile?.full_name ?? "-";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
          <User className="h-10 w-10" aria-hidden />
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-foreground">{fullName}</h1>
          <p className="text-lg text-muted-foreground">{professional.title ?? "-"}</p>
          {professional.location && (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" aria-hidden />
              {professional.location}
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {professional.linkedin_url && (
              <a href={professional.linkedin_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  LinkedIn <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            )}
            {professional.github_url && (
              <a href={professional.github_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  GitHub <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            )}
            {professional.portfolio_url && (
              <a href={professional.portfolio_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  {t("profile.portfolio")} <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </a>
            )}
          </div>
        </div>
      </header>

      {professional.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("profile.bio")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-muted-foreground">{professional.bio}</p>
          </CardContent>
        </Card>
      )}

      {professional.professional_skills && professional.professional_skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("talent.skills")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(professional.professional_skills as { skill_name: string; skill_level: string }[]).map((s) => (
                <span
                  key={s.skill_name}
                  className="rounded-full bg-muted px-3 py-1 text-sm"
                >
                  {s.skill_name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {professional.professional_experience && professional.professional_experience.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="h-5 w-5" aria-hidden />
              {t("talent.experience")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(professional.professional_experience as Array<{
              company_name: string;
              position: string;
              start_date: string;
              end_date?: string;
              description?: string;
            }>).map((exp) => (
              <div key={exp.company_name + exp.position}>
                <p className="font-semibold">{exp.position} - {exp.company_name}</p>
                <p className="text-sm text-muted-foreground">
                  {exp.start_date} - {exp.end_date ?? t("talent.present")}
                </p>
                {exp.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {professional.professional_education && professional.professional_education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" aria-hidden />
              {t("talent.education")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(professional.professional_education as Array<{
              institution: string;
              degree?: string;
              field_of_study?: string;
              start_date: string;
              end_date?: string;
            }>).map((edu) => (
              <div key={edu.institution}>
                <p className="font-semibold">{edu.institution}</p>
                <p className="text-sm text-muted-foreground">
                  {[edu.degree, edu.field_of_study].filter(Boolean).join(" • ")} - {edu.start_date} - {edu.end_date ?? t("talent.present")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap justify-center gap-2">
        <Link to="/empleos">
          <Button variant="outline">{t("talent.viewJobs")}</Button>
        </Link>
        {professional.user_id !== user?.id && (
          <Button
            onClick={async () => {
              if (!isAuthenticated) {
                navigate(`/auth?redirect=/perfil/${id}`);
                toast.info(t("talent.contactLoginRequired"));
                return;
              }
              const result = await expressInterest(professional.id);
              if (result.success) {
                toast.success(t("talent.contactSuccess"));
              } else if (result.error === "already_expressed") {
                toast.info(t("talent.contactAlreadyExpressed"));
              } else {
                toast.error(result.error);
              }
            }}
            disabled={isSubmitting}
          >
            {t("talent.contact")}
          </Button>
        )}
      </div>
    </article>
      </main>
    </div>
  );
}
