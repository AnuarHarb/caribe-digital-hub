import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters, type JobFiltersState } from "@/components/jobs/JobFilters";
import { useJobs } from "@/hooks/useJobs";
import { useTranslation } from "react-i18next";

export default function JobBoard() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<JobFiltersState>({});
  const { jobs, isLoading } = useJobs(filters);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">
            {t("nav.jobs")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("landing.featuredJobs.subtitle")}
          </p>
        </header>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-64 shrink-0">
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
                  const company = job.company_profiles as { company_name?: string; logo_url?: string | null } | null;
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
      </main>
    </div>
  );
}
