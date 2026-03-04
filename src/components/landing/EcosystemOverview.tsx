import { useTranslation } from "react-i18next";
import {
  Users,
  GraduationCap,
  Hammer,
  Rocket,
  TrendingUp,
  ArrowRight,
  ArrowDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Stage {
  key: string;
  icon: LucideIcon;
}

const STAGES: Stage[] = [
  { key: "community", icon: Users },
  { key: "education", icon: GraduationCap },
  { key: "build", icon: Hammer },
  { key: "startups", icon: Rocket },
  { key: "investment", icon: TrendingUp },
];

export function EcosystemOverview() {
  const { t } = useTranslation();

  return (
    <section
      id="ecosystem-overview"
      aria-labelledby="ecosystem-heading"
      className="py-14 md:py-20"
    >
      <div className="container mx-auto px-4">
        <h2
          id="ecosystem-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.ecosystem.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.ecosystem.subtitle")}
        </p>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <div key={stage.key} className="flex flex-col items-center gap-4 lg:flex-row">
                <article className="group flex w-full flex-1 flex-col items-center rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-6 w-6" aria-hidden />
                  </div>
                  <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                    {t(`landing.ecosystem.${stage.key}.title`)}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {t(`landing.ecosystem.${stage.key}.description`)}
                  </p>
                </article>

                {i < STAGES.length - 1 && (
                  <>
                    <ArrowDown
                      className="h-5 w-5 shrink-0 text-muted-foreground/40 sm:hidden"
                      aria-hidden
                    />
                    <ArrowDown
                      className="hidden h-5 w-5 shrink-0 text-muted-foreground/40 sm:block lg:hidden"
                      aria-hidden
                    />
                    <ArrowRight
                      className="hidden h-5 w-5 shrink-0 text-muted-foreground/40 lg:block"
                      aria-hidden
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
