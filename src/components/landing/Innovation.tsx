import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillarBadge } from "@/components/landing/PillarBadge";

const CIUDAD_INMERSIVA_URL = "https://ciudadinmersiva.com";

export function Innovation() {
  const { t } = useTranslation();
  const tags = t("landing.innovation.tags", { returnObjects: true }) as string[];

  return (
    <section aria-labelledby="innovation-heading" className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          <figure className="order-last overflow-hidden rounded-xl lg:order-first">
            <img
              src="/events/barranqui-ia-2025.webp"
              alt=""
              className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              aria-hidden
            />
          </figure>

          <article className="rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg lg:text-left">
            <PillarBadge pillar="innovation" />
            <div className="mt-4 flex justify-center lg:justify-start">
              <img
                src="/logos/ciudad-inmersiva.png"
                alt="Ciudad Inmersiva"
                className="h-12 w-auto object-contain dark:invert"
              />
            </div>
            <h2
              id="innovation-heading"
              className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl"
            >
              {t("landing.innovation.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("landing.innovation.description")}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
            <a
              href={CIUDAD_INMERSIVA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block"
            >
              <Button className="transition-colors">
                {t("landing.innovation.cta")}
              </Button>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
