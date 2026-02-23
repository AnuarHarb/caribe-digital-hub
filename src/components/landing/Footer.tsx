import { useTranslation } from "react-i18next";
import { Calendar, Map } from "lucide-react";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-sm text-muted-foreground">{t("home.footer.copyright")}</p>
            <p className="text-sm text-muted-foreground">{t("home.footer.cities")}</p>
          </div>
          <nav
            className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
            aria-label={t("landing.footer.externalLinks")}
          >
            <a
              href="https://www.codigoabierto.tech/eventos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Calendar className="h-4 w-4" aria-hidden />
              {t("landing.footer.events")}
            </a>
            <a
              href="https://shelv.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Map className="h-4 w-4" aria-hidden />
              {t("landing.footer.ecosystemMap")}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
