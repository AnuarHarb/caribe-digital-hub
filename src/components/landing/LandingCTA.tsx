import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

const COMMUNITY_URL = "https://chat.whatsapp.com/HEHmdscnxsx2CdkLpLQzqO?mode=gi_t";
const PARTNER_EMAIL = "mailto:hola@costadigital.org";

export function LandingCTA() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="cta-heading"
      className="py-20 md:py-28 bg-primary text-primary-foreground"
    >
      <div className="container mx-auto px-4 text-center">
        <h2
          id="cta-heading"
          className="font-display text-3xl font-bold text-primary-foreground md:text-4xl"
        >
          {t("landing.cta.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
          {t("landing.cta.subtitle")}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="secondary"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
            >
              {t("landing.cta.ctaJoin")}
            </Button>
          </a>
          <a href={PARTNER_EMAIL}>
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
            >
              {t("landing.cta.ctaPartner")}
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
