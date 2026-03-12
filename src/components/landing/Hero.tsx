import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "@/assets/costa-digital-logo.png";

interface HeroStat {
  value: string;
  label: string;
}

export function Hero() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const stats = t("landing.hero.stats", { returnObjects: true }) as HeroStat[];

  const scrollToEcosystem = () => {
    document
      .getElementById("ecosystem-overview")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCommunities = () => {
    document
      .getElementById("community-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="hero-bg relative overflow-hidden py-20 md:py-32">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 dark:opacity-15"
        style={{ backgroundImage: "url(/events/tech-caribe.jpg)" }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[hsl(215,55%,6%)]/65 dark:bg-transparent"
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

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl dark:text-primary">
          {t("landing.hero.title")}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white md:text-xl dark:text-muted-foreground">
          {t("landing.hero.subtitle")}
        </p>

        <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center">
              <dt className="font-display text-3xl font-bold text-accent md:text-4xl">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-white dark:text-muted-foreground">
                {stat.label}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!isAuthenticated ? (
            <Link to="/auth">
              <Button
                size="lg"
                className="w-full transition-all duration-300 hover:shadow-lg sm:w-auto"
              >
                {t("landing.hero.ctaJoin")}
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/blog">
                <Button
                  size="lg"
                  className="w-full transition-all duration-300 hover:shadow-lg sm:w-auto"
                >
                  {t("landing.hero.ctaDiscover")}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="w-full transition-all duration-300 hover:border-accent/50 sm:w-auto"
                onClick={scrollToCommunities}
              >
                {t("landing.hero.ctaExploreCommunities")}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="lg"
            className="w-full transition-all duration-300 hover:border-accent/50 sm:w-auto"
            onClick={scrollToEcosystem}
          >
            {t("landing.hero.ctaExplore")}
          </Button>
        </div>
      </div>
    </header>
  );
}
