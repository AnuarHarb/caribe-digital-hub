import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { pillars, colorClasses } from "./pillarsData";

export function EcosystemPillars() {
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  const selectedPillarData = selectedPillar
    ? pillars.find((p) => p.id === selectedPillar)
    : null;

  return (
    <section id="porque">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-5 py-16">
        <div className="flex flex-col gap-10">
          <header className="text-center">
            <h2 className="mb-3 text-4xl font-bold text-foreground md:text-5xl">
              4 pilares que construyen el{" "}
              <span className="text-blue-500">
                futuro tecnológico del Caribe
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
              Costa Digital articula cuatro instituciones complementarias que, de
              la mano de Fundación Código Abierto, cubren todo el ciclo:
              formación, comunidad, innovación e inversión.
            </p>
          </header>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-gradient-to-br from-blue-50 via-background to-purple-50 p-8 shadow-lg md:p-12 dark:from-blue-950/40 dark:to-purple-950/40">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px),
                                   linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              />

              <ul className="relative z-0 flex flex-col gap-4 md:flex-row md:gap-6">
                {pillars.map((pillar) => {
                  const colors = colorClasses[pillar.color];

                  return (
                    <li key={pillar.id} className="relative flex-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPillar(pillar.id)}
                        className={`group flex h-full w-full cursor-pointer flex-col rounded-xl border-2 bg-card p-5 text-left shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg md:p-6 ${colors.border} ${colors.light} dark:bg-card`}
                        aria-label={`Ver más sobre ${pillar.title} - ${pillar.institution}`}
                      >
                        <div className="relative mb-4 h-14 w-full">
                          <img
                            src={pillar.logo}
                            alt={pillar.logoAlt}
                            className="h-full w-full object-contain opacity-90"
                            loading="lazy"
                          />
                        </div>

                        <div className="mb-3">
                          <div className="mb-1.5 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold text-white shadow-sm ${colors.bg}`}
                            >
                              {pillar.number}
                            </span>
                            <h3 className="text-lg font-bold text-foreground md:text-xl">
                              {pillar.title}
                            </h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pillar.subtitle}
                          </p>
                        </div>

                        <div className="mb-4">
                          <p className="line-clamp-4 text-sm leading-relaxed text-foreground/80">
                            {pillar.description}
                          </p>
                        </div>

                        <div className="mt-auto border-t border-border pt-3">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Click para más información
                            </span>
                            <div
                              className={`h-1.5 w-1.5 animate-pulse rounded-full ${colors.bg}`}
                            />
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {selectedPillarData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedPillar(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`pillar-${selectedPillarData.id}-title`}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <header
              className={`sticky top-0 flex items-start justify-between border-b-2 p-6 ${
                colorClasses[selectedPillarData.color].light
              } ${colorClasses[selectedPillarData.color].border}`}
            >
              <div className="flex flex-1 items-center gap-4">
                <div className="relative h-12 w-20 flex-shrink-0">
                  <img
                    src={selectedPillarData.logo}
                    alt={selectedPillarData.logoAlt}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold text-white ${
                        colorClasses[selectedPillarData.color].bg
                      }`}
                    >
                      {selectedPillarData.number}
                    </span>
                    <h3
                      id={`pillar-${selectedPillarData.id}-title`}
                      className="text-2xl font-bold text-foreground"
                    >
                      {selectedPillarData.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedPillarData.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPillar(null)}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
                aria-label="Cerrar"
                type="button"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </header>

            <div className="space-y-6 p-6">
              <p className="text-base leading-relaxed text-foreground/80">
                {selectedPillarData.fullDescription}
              </p>

              {selectedPillarData.features && (
                <div>
                  <h4 className="mb-3 text-lg font-semibold text-foreground">
                    Características principales:
                  </h4>
                  <ul className="space-y-2">
                    {selectedPillarData.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-foreground/80"
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${
                            colorClasses[selectedPillarData.color].bg
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedPillarData.website && (
                <div className="border-t border-border pt-4">
                  <a
                    href={selectedPillarData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-opacity hover:opacity-90 ${
                      colorClasses[selectedPillarData.color].bg
                    }`}
                  >
                    Visitar {selectedPillarData.institution}
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
