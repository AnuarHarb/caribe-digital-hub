import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const EVENTS_URL = "https://www.codigoabierto.tech/eventos";

const EVENT_IMAGES = [
  "/events/barranqui-ia-2025.webp",
  "/events/1.webp",
  "/events/2.webp",
  "/events/3.webp",
  "/events/4.webp",
  "/events/6.webp",
  "/events/7.webp",
];

export function EventsCTA() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="events-cta-heading"
      className="py-12 md:py-16 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* CTA Card with FCA logo */}
          <article className="rounded-xl border border-border bg-card p-8 text-center shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg lg:text-left">
            <div className="flex justify-center lg:justify-start">
              {/* Light mode: dark logo for contrast on light background */}
              <img
                src="/logos/fca-black.png"
                alt="Fundación Código Abierto"
                className="h-14 w-auto object-contain dark:hidden"
              />
              {/* Dark mode: light/colored logo for contrast on dark background */}
              <img
                src="/logos/logo-fca.webp"
                alt="Fundación Código Abierto"
                className="hidden h-14 w-auto object-contain dark:block"
              />
            </div>
            <h2
              id="events-cta-heading"
              className="mt-4 font-display text-xl font-semibold text-foreground md:text-2xl"
            >
              {t("landing.eventsCta.title")}
            </h2>
            <p className="mt-2 text-muted-foreground">
              {t("landing.eventsCta.description")}
            </p>
            <a
              href={EVENTS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block"
            >
              <Button className="transition-colors">{t("landing.eventsCta.cta")}</Button>
            </a>
          </article>

          {/* Event images carousel */}
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {EVENT_IMAGES.map((src, index) => (
                  <CarouselItem
                    key={src}
                    className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/2"
                  >
                    <div className="overflow-hidden rounded-lg aspect-[4/3] bg-muted">
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        aria-hidden
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
