import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pillars, colorClasses } from "@/components/conocenos/pillarsData";

export function PillarsOverview() {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPillar = selected
    ? pillars.find((p) => p.id === selected) ?? null
    : null;

  return (
    <section
      id="ecosystem-overview"
      aria-labelledby="pillars-heading"
      className="py-16 md:py-24"
    >
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent md:text-sm">
            {t("landing.pillars.eyebrow")}
          </p>
          <h2
            id="pillars-heading"
            className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl"
          >
            {t("landing.pillars.title")}
          </h2>
          <p className="mx-auto mt-4 text-muted-foreground">
            {t("landing.pillars.subtitle")}
          </p>
        </header>

        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const colors = colorClasses[pillar.color];
            return (
              <li key={pillar.id} className="flex">
                <button
                  type="button"
                  onClick={() => setSelected(pillar.id)}
                  className={`group flex h-full w-full cursor-pointer flex-col rounded-xl border-2 bg-card p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${colors.border} ${colors.light} dark:bg-card`}
                  aria-label={`${pillar.title} — ${pillar.institution}`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${colors.bg}`}
                    >
                      {pillar.number}
                    </span>
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className={`text-sm font-semibold ${colors.text}`}>
                    {pillar.institution}
                  </p>
                  <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-foreground/75">
                    {pillar.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                    <span className="text-xs text-muted-foreground">
                      {t("landing.pillars.hint")}
                    </span>
                    <div className={`h-1.5 w-1.5 animate-pulse rounded-full ${colors.bg}`} />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center">
          <Link to="/conocenos">
            <Button size="lg">{t("landing.pillars.cta")}</Button>
          </Link>
        </div>
      </div>

      {selectedPillar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`home-pillar-${selectedPillar.id}-title`}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className={`sticky top-0 flex items-start justify-between border-b-2 p-6 ${colorClasses[selectedPillar.color].light} ${colorClasses[selectedPillar.color].border}`}
            >
              <div className="flex flex-1 items-center gap-4">
                <img
                  src={selectedPillar.logo}
                  alt={selectedPillar.logoAlt}
                  className="h-10 w-auto max-w-[120px] object-contain"
                />
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${colorClasses[selectedPillar.color].bg}`}
                    >
                      {selectedPillar.number}
                    </span>
                    <h3
                      id={`home-pillar-${selectedPillar.id}-title`}
                      className="text-2xl font-bold text-foreground"
                    >
                      {selectedPillar.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPillar.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
                aria-label="Cerrar"
                type="button"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </header>

            <div className="space-y-6 p-6">
              <p className="text-base leading-relaxed text-foreground/80">
                {selectedPillar.fullDescription}
              </p>

              {selectedPillar.features && (
                <ul className="space-y-2">
                  {selectedPillar.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${colorClasses[selectedPillar.color].bg}`}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              {selectedPillar.website && (
                <div className="border-t border-border pt-4">
                  <a
                    href={selectedPillar.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-opacity hover:opacity-90 ${colorClasses[selectedPillar.color].bg}`}
                  >
                    Visitar {selectedPillar.institution}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
