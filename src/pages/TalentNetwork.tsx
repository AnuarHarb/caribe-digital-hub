import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters, type JobFiltersState } from "@/components/jobs/JobFilters";
import { TalentCard } from "@/components/talent/TalentCard";
import { TalentFilters, type TalentFiltersState } from "@/components/talent/TalentFilters";
import { useJobs } from "@/hooks/useJobs";
import { Briefcase, Users } from "lucide-react";

const TAB_KEY = "tab";
const DEFAULT_TAB = "ofertas";

export default function TalentNetwork() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get(TAB_KEY) ?? DEFAULT_TAB;

  const handleTabChange = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === DEFAULT_TAB) {
        next.delete(TAB_KEY);
      } else {
        next.set(TAB_KEY, value);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Red de Talento Tech del Caribe | Desarrolladores, Diseñadores, IA"
        description="Conecta con desarrolladores, diseñadores e ingenieros de IA del Caribe colombiano. Encuentra ofertas de empleo tech o talento especializado en Barranquilla, Cartagena y Santa Marta."
        canonical="/talento"
        keywords={["Caribe Tech", "talento tech del Caribe", "desarrolladores Caribe", "empleos tech Barranquilla", "diseñadores Caribe", "IA Caribe"]}
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">{t("breadcrumb.home")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/talento">{t("nav.talentNetwork")}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {currentTab === "talento"
                  ? t("talentNetwork.tabTalent")
                  : t("talentNetwork.tabJobs")}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">
            {t("nav.talentNetwork")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("talentNetwork.subtitle")}
          </p>
        </header>

        <Tabs value={currentTab} onValueChange={handleTabChange}>
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="ofertas" className="gap-2">
              <Briefcase className="h-4 w-4" aria-hidden />
              {t("talentNetwork.tabJobs")}
            </TabsTrigger>
            <TabsTrigger value="talento" className="gap-2">
              <Users className="h-4 w-4" aria-hidden />
              {t("talentNetwork.tabTalent")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ofertas">
            <JobsTab />
          </TabsContent>
          <TabsContent value="talento">
            <TalentTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function JobsTab() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<JobFiltersState>({});
  const { jobs, isLoading } = useJobs(filters);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="shrink-0 lg:w-64">
        <JobFilters filters={filters} onFiltersChange={setFilters} />
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => {
              const company = job.company_profiles as {
                company_name?: string;
                logo_url?: string | null;
              } | null;
              return (
                <JobCard
                  key={job.id}
                  id={job.id}
                  slug={job.slug}
                  title={job.title}
                  companyName={company?.company_name}
                  companyLogoUrl={company?.logo_url}
                  location={job.location}
                  workMode={job.work_mode}
                  employmentType={job.employment_type}
                  description={job.description}
                  salaryMin={job.salary_min}
                  salaryMax={job.salary_max}
                  salaryCurrency={job.salary_currency}
                  createdAt={job.created_at}
                />
              );
            })}
          </div>
        )}
        {jobs.length === 0 && !isLoading && (
          <p className="py-12 text-center text-muted-foreground">
            {t("landing.featuredJobs.empty")}
          </p>
        )}
      </div>
    </div>
  );
}

function TalentTab() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TalentFiltersState>({});

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["talent-directory", filters],
    queryFn: async () => {
      const select = filters.skill
        ? `
          id,
          slug,
          title,
          bio,
          location,
          years_experience,
          availability,
          profiles(full_name, avatar_url),
          professional_skills!inner(skill_name)
        `
        : `
          id,
          slug,
          title,
          bio,
          location,
          years_experience,
          availability,
          profiles(full_name, avatar_url),
          professional_skills(skill_name)
        `;

      let query = supabase
        .from("professional_profiles")
        .select(select)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (filters.availability) {
        query = query.eq("availability", filters.availability);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
        );
      }
      if (filters.skill) {
        query = query.eq("professional_skills.skill_name", filters.skill);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="shrink-0 lg:w-64">
        <TalentFilters filters={filters} onFiltersChange={setFilters} />
      </div>
      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {professionals?.map((p) => {
              const profile = p.profiles as {
                full_name?: string;
                avatar_url?: string;
              } | null;
              const skills =
                (
                  p.professional_skills as { skill_name: string }[] | null
                )?.map((s) => s.skill_name) ?? [];
              return (
                <TalentCard
                  key={p.id}
                  id={p.id}
                  slug={p.slug}
                  title={p.title}
                  location={p.location}
                  yearsExperience={p.years_experience}
                  fullName={profile?.full_name}
                  avatarUrl={profile?.avatar_url}
                  skills={skills}
                  bio={p.bio}
                  availability={p.availability}
                />
              );
            })}
          </div>
        )}
        {professionals?.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            {t("landing.featuredTalent.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
