import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/costa-digital-logo.png";

export function HeroTalent() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <header className="hero-bg relative overflow-hidden py-20 md:py-32">
      {/* Subtle event image overlay for visual depth */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: "url(/events/barranqui-ia-2025.webp)" }}
        aria-hidden
      />
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="flex justify-center mb-6">
          <img 
            src={logoImage} 
            alt="Costa Digital" 
            className="h-16 w-16 md:h-20 md:w-20 drop-shadow-lg"
          />
        </div>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-primary md:text-6xl lg:text-7xl">
          {t("landing.hero.title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t("landing.hero.subtitle")}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isAuthenticated ? (
            <>
              <Link to="/empleos">
                <Button
                  size="lg"
                  className="w-full transition-all duration-300 hover:shadow-lg sm:w-auto"
                >
                  {t("landing.hero.exploreJobs")}
                </Button>
              </Link>
              <Link to="/para-empresas">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full transition-all duration-300 hover:border-accent/50 sm:w-auto"
                >
                  {t("landing.hero.ctaCompany")}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth?type=professional">
                <Button
                  size="lg"
                  className="w-full transition-all duration-300 hover:shadow-lg sm:w-auto"
                >
                  {t("landing.hero.ctaProfessional")}
                </Button>
              </Link>
              <Link to="/auth?type=company">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full transition-all duration-300 hover:border-accent/50 sm:w-auto"
                >
                  {t("landing.hero.ctaCompany")}
                </Button>
              </Link>
            </>
          )}
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/empleos">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full transition-colors hover:text-foreground"
            >
              {t("landing.hero.browseJobs")}
            </Button>
          </Link>
          <span className="text-muted-foreground/50" aria-hidden>
            •
          </span>
          <Link to="/talento">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full transition-colors hover:text-foreground"
            >
              {t("landing.hero.browseTalent")}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
