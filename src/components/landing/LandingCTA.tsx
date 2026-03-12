import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";

const PARTNER_EMAIL = "mailto:hola@costadigital.org";

export function LandingCTA() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const scrollToCommunities = () => {
    document
      .getElementById("community-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

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
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
              >
                {t("landing.cta.ctaJoin")}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/blog">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
                >
                  {t("landing.cta.ctaDiscover")}
                </Button>
              </Link>
              <Button
                size="lg"
                variant="secondary"
                className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
                onClick={scrollToCommunities}
              >
                {t("landing.cta.ctaExploreCommunities")}
              </Button>
            </>
          )}
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
