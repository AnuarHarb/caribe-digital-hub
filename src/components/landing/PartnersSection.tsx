import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const PARTNERS = [
  { name: "Fundación Código Abierto", logo: "/logos/fca-black.png", logoDark: "/logos/logo-fca.webp", url: "https://www.codigoabierto.tech" },
  { name: "Tech Centre", logo: "/logos/tech-centre-dark.png", logoDark: "/logos/tech-centre-white.png", url: "https://techcentre.co" },
  { name: "Shelv", logo: "/logos/shelv.png", logoDark: "/logos/shelv.png", url: "https://shelv.io" },
  { name: "Synergy", logo: "/logos/synergy.png", logoDark: "/logos/synergy.png", invertDark: true, url: "https://www.snrg.lat/inicio" },
  { name: "Caribe Ventures", logo: "/logos/caribe-ventures-black.png", logoDark: "/logos/caribe-ventures-white.png", url: "https://caribe.ventures" },
  { name: "Ciudad Inmersiva", logo: "/logos/ciudad-inmersiva.png", logoDark: "/logos/ciudad-inmersiva.png", invertDark: true, url: "https://ciudadinmersiva.com" },
];

export function PartnersSection() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="partners-heading"
      className="py-20 md:py-28 bg-muted/30"
    >
      <div className="container mx-auto px-4">
        <h2
          id="partners-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.partners.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.partners.subtitle")}
        </p>

        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-10 md:gap-16">
          {PARTNERS.map((partner) => {
            const content = (
              <figure
                className="grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 w-auto object-contain dark:hidden md:h-14"
                  loading="lazy"
                />
                <img
                  src={partner.logoDark}
                  alt={partner.name}
                  className={cn(
                    "hidden h-12 w-auto object-contain dark:block md:h-14",
                    partner.invertDark && "dark:invert"
                  )}
                  loading="lazy"
                />
              </figure>
            );
            return partner.url ? (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-opacity hover:opacity-90"
              >
                {content}
              </a>
            ) : (
              <div key={partner.name}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
