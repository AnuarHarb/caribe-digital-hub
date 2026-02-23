import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Building2, Briefcase } from "lucide-react";

export function Stats() {
  const { t } = useTranslation();

  const { data: stats } = useQuery({
    queryKey: ["landing-stats"],
    queryFn: async () => {
      const [professionalsRes, companiesRes, jobsRes] = await Promise.all([
        supabase
          .from("professional_profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("company_profiles")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("job_postings")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
      ]);
      return {
        professionals: professionalsRes.count ?? 0,
        companies: companiesRes.count ?? 0,
        jobs: jobsRes.count ?? 0,
      };
    },
  });

  const items = [
    {
      label: t("landing.stats.professionals"),
      value: stats?.professionals ?? 0,
      icon: Users,
    },
    {
      label: t("landing.stats.companies"),
      value: stats?.companies ?? 0,
      icon: Building2,
    },
    {
      label: t("landing.stats.jobs"),
      value: stats?.jobs ?? 0,
      icon: Briefcase,
    },
  ];

  return (
    <section
      aria-label={t("landing.stats.title")}
      className="py-16 md:py-20 bg-primary text-primary-foreground"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-3 md:gap-16 text-center">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex flex-col items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-foreground/10">
                  <Icon className="h-7 w-7 text-primary-foreground" aria-hidden />
                </div>
                <p className="font-display text-4xl font-bold md:text-5xl">
                  {item.value}
                </p>
                <p className="text-primary-foreground/80">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
