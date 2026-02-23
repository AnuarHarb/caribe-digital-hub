import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

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
          <Link to="/auth?type=professional">
            <Button
              size="lg"
              variant="secondary"
              className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
            >
              {t("landing.cta.ctaProfessional")}
            </Button>
          </Link>
          <Link to="/auth?type=company">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-primary-foreground/50 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            >
              {t("landing.cta.ctaCompany")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
