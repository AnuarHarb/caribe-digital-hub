import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const TECH_CENTRE_URL = "https://techcentre.co";

export function TechCentre() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="tech-centre-heading"
      className="py-12 md:py-16 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">

          <figure className="overflow-hidden rounded-xl">
            <img
              src="/events/screenshot-techcentre.png"
              alt=""
              className="aspect-video w-full object-cover transition-transform duration-300 hover:scale-105"
              loading="lazy"
              aria-hidden
            />
          </figure>

          <article className="rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg lg:text-left">
            <div className="flex justify-center lg:justify-start">
              <img
                src="/logos/tech-centre-dark.png"
                alt="Tech Centre"
                className="h-14 w-auto object-contain dark:hidden"
              />
              <img
                src="/logos/tech-centre-white.png"
                alt="Tech Centre"
                className="hidden h-14 w-auto object-contain dark:block"
              />
            </div>
            <h2
              id="tech-centre-heading"
              className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl"
            >
              {t("landing.techCentre.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("landing.techCentre.description")}
            </p>
            <a
              href={TECH_CENTRE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block"
            >
              <Button className="transition-colors">{t("landing.techCentre.cta")}</Button>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
