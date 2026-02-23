import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const ECOSYSTEM_MAP_URL = "https://shelv.io/";

export function EcosystemMapCTA() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="ecosystem-map-cta-heading"
      className="py-12 md:py-16"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Screenshot del mapa Shelv */}
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-md">
            <img
              src="/events/screenshot-shelv.png"
              alt="Mapa del ecosistema tech en Shelv - Descubre startups del Caribe"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* CTA Card con logo Shelv */}
          <article className="rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <img
                src="/logos/shelv.png"
                alt="Shelv"
                className="h-20 w-20 object-contain md:h-24 md:w-24"
              />
            </div>
            <h2
              id="ecosystem-map-cta-heading"
              className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl"
            >
              {t("landing.ecosystemMapCta.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("landing.ecosystemMapCta.description")}
            </p>
            <a
              href={ECOSYSTEM_MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block"
            >
              <Button variant="outline" className="transition-colors">
                {t("landing.ecosystemMapCta.cta")}
              </Button>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
