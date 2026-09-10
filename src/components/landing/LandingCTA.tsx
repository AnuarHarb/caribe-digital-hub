import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { WhatsappLogo } from "@phosphor-icons/react";
import { waLink } from "@/lib/waLink";

export function LandingCTA() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const authUrl = `/auth/signup?redirect=${encodeURIComponent("/")}`;
  const showSignup = !isLoading && !isAuthenticated;

  return (
    <section aria-labelledby="cta-heading" className="bg-navy py-20 text-white md:py-28">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="text-center md:text-left">
            <h2 id="cta-heading" className="font-display text-3xl font-extrabold md:text-4xl">
              {t("portafolio.cta.title")}{" "}
              <em className="not-italic text-aqua">{t("portafolio.cta.emphasis")}</em>
            </h2>
            <p className="mt-3 font-mono text-sm text-[#C8D2EE]">{t("portafolio.cta.subtitle")}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <a href={waLink("general", locale)} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="w-full sm:w-auto">
                <WhatsappLogo weight="fill" aria-hidden />
                {t("portafolio.cta.whatsapp")}
              </Button>
            </a>
            {showSignup && (
              <Link to={authUrl}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  {t("portafolio.cta.createAccount")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
