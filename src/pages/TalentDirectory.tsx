import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TalentCard } from "@/components/talent/TalentCard";
import { TalentFilters, type TalentFiltersState } from "@/components/talent/TalentFilters";
import { useTranslation } from "react-i18next";

export default function TalentDirectory() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<TalentFiltersState>({});

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["talent-directory", filters],
    queryFn: async () => {
      let query = supabase
        .from("professional_profiles")
        .select(`
          id,
          title,
          location,
          years_experience,
          availability,
          profiles(full_name)
        `)
        .order("created_at", { ascending: false });

      if (filters.availability) {
        query = query.eq("availability", filters.availability);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,bio.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="font-display text-3xl font-bold text-primary">
            {t("nav.talent")}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t("landing.featuredTalent.subtitle")}
          </p>
        </header>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:w-64 shrink-0">
            <TalentFilters filters={filters} onFiltersChange={setFilters} />
          </div>
          <div className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {professionals?.map((p) => (
                  <TalentCard
                    key={p.id}
                    id={p.id}
                    title={p.title}
                    location={p.location}
                    yearsExperience={p.years_experience}
                    fullName={(p.profiles as { full_name?: string })?.full_name}
                  />
                ))}
              </div>
            )}
            {professionals?.length === 0 && (
              <p className="py-12 text-center text-muted-foreground">
                {t("landing.featuredTalent.empty")}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
