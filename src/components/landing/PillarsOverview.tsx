import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { pillars, colorClasses } from "@/components/conocenos/pillarsData";

export function PillarsOverview() {
  const { t } = useTranslation();

  return (
    <section id="ecosystem-overview" aria-labelledby="pillars-heading" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("landing.pillars.eyebrow")}</p>
          <h2 id="pillars-heading" className="mt-3 text-balance font-display text-3xl font-bold text-navy md:text-4xl dark:text-primary">
            {t("landing.pillars.title")}
          </h2>
          <p className="mx-auto mt-4 text-muted-foreground">{t("landing.pillars.subtitle")}</p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const colors = colorClasses[pillar.color];
            return (
              <li key={pillar.id} className="flex">
                <article className={`flex h-full w-full flex-col rounded-xl border-2 bg-card p-6 ${colors.border}`}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 font-mono text-xs font-bold text-white ${colors.bg}`}>
                      {pillar.number}
                    </span>
                    <h3 className="min-w-0 text-balance font-display text-xl font-bold leading-tight">{pillar.title}</h3>
                  </div>
                  <p className={`text-sm font-semibold ${colors.text}`}>{pillar.institution}</p>
                  <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {pillar.description}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link to="/conocenos#manifiesto">
            <Button size="lg">{t("landing.pillars.cta")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
