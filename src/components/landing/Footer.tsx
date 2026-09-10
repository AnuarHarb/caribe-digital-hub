import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CalendarBlank, MapTrifold, WhatsappLogo } from "@phosphor-icons/react";
import { DESCRIPTOR, WHATSAPP } from "@/content/portafolio";
import { MareaLogo } from "@/components/MareaLogo";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-muted/30 py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-4 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t("home.footer.copyright")}</p>
              <p className="text-sm text-muted-foreground">{t("home.footer.cities")}</p>
            </div>
            <p className="text-sm font-medium text-foreground">{DESCRIPTOR}</p>
            <nav
              className="flex max-w-md flex-wrap justify-center gap-x-5 gap-y-2 md:justify-start"
              aria-label={t("nav.ecosistema")}
            >
              {[
                { to: "/membresias", label: t("nav.membresias") },
                { to: "/conocenos", label: t("nav.nosotros") },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
              <Link to="/noticias" aria-label={t("nav.marea")} className="inline-flex items-center hover:opacity-90">
                <MareaLogo className="h-6" />
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-center gap-4">
            <a
              href="https://www.codigoabierto.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
              aria-label="Fundación Código Abierto"
            >
              <img
                src="/logos/fca-black.png"
                alt=""
                className="h-8 w-auto object-contain dark:hidden"
                aria-hidden
              />
              <img
                src="/logos/logo-fca.webp"
                alt=""
                className="hidden h-8 w-auto object-contain dark:block"
                aria-hidden
              />
              <span className="text-sm text-muted-foreground">{t("home.footer.fcaInitiative")}</span>
            </a>
            <nav
              className="flex flex-col items-center gap-4 sm:flex-row sm:gap-8"
              aria-label={t("landing.footer.externalLinks")}
            >
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <WhatsappLogo className="h-4 w-4" weight="fill" aria-hidden />
                WhatsApp
              </a>
              <a
                href="https://www.codigoabierto.tech/eventos"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <CalendarBlank className="h-4 w-4" aria-hidden />
                {t("landing.footer.events")}
              </a>
              <a
                href="https://shelv.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <MapTrifold className="h-4 w-4" aria-hidden />
                {t("landing.footer.ecosystemMap")}
              </a>
            </nav>
          </div>
          <nav className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6 md:items-end" aria-label={t("landing.footer.legal")}>
            <Link to="/terminos" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t("legal.termsTitle")}
            </Link>
            <Link to="/aviso-de-privacidad" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {t("legal.privacyTitle")}
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
