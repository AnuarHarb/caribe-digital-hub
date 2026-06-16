import { useTranslation } from "react-i18next";
import { GraduationCap, Calendar, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ImpactItem {
  title: string;
  text: string;
}

const ICONS: LucideIcon[] = [GraduationCap, Calendar, Sparkles];

export function Impact() {
  const { t } = useTranslation();
  const items = t("landing.impact.items", { returnObjects: true }) as ImpactItem[];

  return (
    <section
      aria-labelledby="impact-heading"
      className="relative overflow-hidden py-20 md:py-28"
    >
      {/* Full-section background photo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20"
        style={{ backgroundImage: "url(/events/hackaton-bquilla-2026-impact.jpg)" }}
        aria-hidden
      />

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4">
        <h2
          id="impact-heading"
          className="text-center font-display text-3xl font-bold text-foreground md:text-4xl"
        >
          {t("landing.impact.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.impact.subtitle")}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => {
            const Icon = ICONS[i] ?? Sparkles;
            return (
              <article
                key={item.title}
                className="rounded-xl border border-border/40 bg-card/70 backdrop-blur-sm p-6 text-center shadow-sm transition-all duration-300 hover:border-accent/40 hover:bg-card/85 hover:shadow-md"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
