import { useTranslation } from "react-i18next";
import { GraduationCap, Award, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ImpactItem {
  title: string;
  text: string;
}

const ICONS: LucideIcon[] = [GraduationCap, Award, Sparkles];

export function Impact() {
  const { t } = useTranslation();
  const items = t("landing.impact.items", { returnObjects: true }) as ImpactItem[];

  return (
    <section
      aria-labelledby="impact-heading"
      className="border-y border-border bg-muted/30 py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <h2
          id="impact-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
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
                className="rounded-xl border border-border bg-card p-6 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-md"
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
