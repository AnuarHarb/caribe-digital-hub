import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { useTranslation } from "react-i18next";
import { ArrowRight, WhatsappLogo } from "@phosphor-icons/react";
import { waLink } from "@/lib/waLink";
import { useAuth } from "@/hooks/useAuth";

const HERO_PHOTO = "/events/tech-caribe.jpg";
const HERO_PHOTO_ALT =
  "Comunidad tech del Caribe reunida en Costa Digital — TechCaribe Fest";

interface HeroStat {
  value: string;
  label: string;
}

export function Hero() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const showSignup = !isLoading && !isAuthenticated;

  const stats = t("landing.hero.stats", { returnObjects: true }) as HeroStat[];
  const title = t("landing.hero.title");
  const emphasis = locale === "es" ? "mundo tech" : "tech world";

  return (
    <header className="hero-bg relative min-h-[32rem] overflow-hidden md:min-h-[36rem]">
      <div className="absolute inset-0" aria-hidden="true">
        <img
          src={HERO_PHOTO}
          alt=""
          className="h-full w-full scale-105 object-cover object-[center_30%]"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/92 to-navy/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-navy/30" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="text-center lg:text-left">
            <BrandLogo
              variant="onDark"
              size="lg"
              className="mx-auto mb-8 lg:mx-0"
            />

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              {title.includes(emphasis) ? (
                <>
                  {title.split(emphasis)[0]}
                  <em className="not-italic text-aqua">{emphasis}</em>
                  {title.split(emphasis)[1]}
                </>
              ) : (
                title
              )}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-[#DDE4F6] md:text-xl lg:mx-0">
              {t("landing.hero.subtitle")}
            </p>

            <dl className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 lg:mx-0">
              {stats.map((stat) => (
                <div key={stat.label} className="border-r border-white/15 last:border-r-0">
                  <dt className="font-display text-2xl font-extrabold text-aqua md:text-3xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1 text-xs text-[#D5DDF3] md:text-sm">{stat.label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link to="/membresias">
                <Button size="lg" className="w-full sm:w-auto">
                  {t("portafolio.hero.ctaMemberships")}
                  <ArrowRight weight="bold" aria-hidden />
                </Button>
              </Link>
              <a href={waLink("general", locale)} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-aqua text-aqua hover:bg-aqua/10 sm:w-auto"
                >
                  <WhatsappLogo weight="fill" aria-hidden />
                  {t("portafolio.hero.ctaWhatsApp")}
                </Button>
              </a>
              {showSignup && (
                <Link to="/auth/signup">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    {t("portafolio.hero.ctaCreateAccount")}
                  </Button>
                </Link>
              )}
            </div>

            <p className="mt-8 font-mono text-xs text-[#8FA0C8]">{t("landing.hero.operatedBy")}</p>
          </div>

          <figure className="relative mx-auto hidden w-full max-w-lg lg:block lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-3 rounded-[1.35rem] bg-aqua/20 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-navy/40 ring-1 ring-white/10">
              <img
                src={HERO_PHOTO}
                alt={HERO_PHOTO_ALT}
                className="aspect-[4/5] w-full object-cover object-[center_25%] sm:aspect-[5/4] lg:aspect-[4/5]"
                loading="eager"
                decoding="async"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/70 to-transparent px-5 pb-5 pt-16 text-left">
                <p className="font-display text-lg font-bold text-white">
                  {locale === "es" ? "La comunidad, en vivo" : "The community, live"}
                </p>
              </figcaption>
            </div>
          </figure>
        </div>
      </div>
    </header>
  );
}
