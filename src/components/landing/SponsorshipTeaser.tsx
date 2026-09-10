import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Handshake } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function SponsorshipTeaser() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="sponsorship-heading" className="border-t border-line py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Handshake className="h-10 w-10 text-brillante" weight="duotone" aria-hidden />
          <h2 id="sponsorship-heading" className="mt-4 font-display text-2xl font-bold text-navy dark:text-primary">
            {t("portafolio.services.patrocinios.title")}
          </h2>
          <p className="mt-3 text-muted-foreground">{t("portafolio.services.patrocinios.description")}</p>
          <Link to="/aliados" className="mt-6">
            <Button variant="secondary">{t("nav.aliados")}</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
