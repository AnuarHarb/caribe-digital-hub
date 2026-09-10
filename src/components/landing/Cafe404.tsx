import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { waLink } from "@/lib/waLink";

const CAFE_PHOTO = "/sede/cafe-404.jpg";
const CAFE_LOGO = "/logos/404-cafe.png";
const CAFE_LOGO_DARK = "/logos/404-cafe-claro.png";
const SCHOOL_URL = "https://institutodelcoctel.com/";

export function Cafe404Credit({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <p className={className}>
      {t("portafolio.cafe404.credit")}{" "}
      <a
        href={SCHOOL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brillante underline underline-offset-2"
      >
        {t("portafolio.cafe404.school")}
      </a>
      {t("portafolio.cafe404.creditEnd")}
    </p>
  );
}

export function Cafe404() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";

  return (
    <section id="cafe-404" aria-labelledby="cafe404-heading" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <figure className="overflow-hidden rounded-2xl border border-line">
            <img
              src={CAFE_PHOTO}
              alt=""
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
              aria-hidden
            />
          </figure>

          <div>
            <img
              src={CAFE_LOGO}
              alt=""
              className="mb-5 h-24 w-auto md:h-28 dark:hidden"
              aria-hidden
            />
            <img
              src={CAFE_LOGO_DARK}
              alt=""
              className="mb-5 hidden h-24 w-auto md:h-28 dark:block"
              aria-hidden
            />
            <h2 id="cafe404-heading" className="sr-only">
              {t("portafolio.cafe404.title")}
            </h2>
            <p className="mt-2 font-mono text-sm text-brillante">{t("portafolio.cafe404.tagline")}</p>
            <p className="mt-4 text-pretty text-muted-foreground">{t("portafolio.cafe404.description")}</p>
            <Cafe404Credit className="mt-3 text-pretty text-muted-foreground" />

            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/servicios#cafe-404">
                <Button>{t("portafolio.cafe404.ctaBonos")}</Button>
              </Link>
              <a href={waLink("cafe404", locale)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">{t("portafolio.cafe404.ctaVisit")}</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
