import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

export function FeaturedTalent() {
  const { t } = useTranslation();

  const { data: professionals, isLoading } = useQuery({
    queryKey: ["featured-talent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_profiles")
        .select(`
          id,
          title,
          location,
          years_experience,
          profiles(full_name)
        `)
        .eq("availability", "available")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section
      aria-labelledby="featured-talent-heading"
      className="py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <h2
          id="featured-talent-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.featuredTalent.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.featuredTalent.subtitle")}
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
                  </div>
                  <Skeleton className="mt-4 h-9 w-full" />
                </CardContent>
              </Card>
            ))
          ) : professionals && professionals.length > 0 ? (
            professionals.map((prof) => (
              <Card
                key={prof.id}
                className="overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                      <User className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {(prof.profiles as { full_name?: string })?.full_name ??
                          "-"}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {prof.title ?? "-"}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {prof.location && <span>{prof.location}</span>}
                    {prof.years_experience != null && (
                      <span>
                        • {t("landing.featuredTalent.years", { count: prof.years_experience })}
                      </span>
                    )}
                  </div>
                  <Link to={`/perfil/${prof.id}`} className="mt-4 block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full transition-colors"
                    >
                      {t("landing.featuredTalent.viewProfile")}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <User className="h-8 w-8 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-4 font-medium text-muted-foreground">
                {t("landing.featuredTalent.empty")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("landing.featuredTalent.emptyInvite")}
              </p>
              <Link to="/auth?type=professional" className="mt-6">
                <Button>{t("landing.hero.ctaProfessional")}</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="mt-10 text-center">
          <Link to="/talento">
            <Button variant="outline" className="transition-colors">
              {t("landing.featuredTalent.viewAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
