import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Coffee, Crown, UsersThree } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

const CLUB_PHOTO = "/sede/club.jpg";

export function MembershipTeaser() {
  const { t } = useTranslation();

  const plans = [
    {
      key: "miembro",
      icon: Coffee,
      href: "/membresias#miembro",
    },
    {
      key: "residente",
      icon: Crown,
      href: "/membresias#residente",
    },
    {
      key: "creyentes",
      icon: UsersThree,
      href: "/membresias#creyentes",
    },
  ] as const;

  return (
    <section id="membresia" aria-labelledby="membership-teaser-heading">
      <div className="relative isolate min-h-[22rem] overflow-hidden px-4 py-16 md:min-h-[28rem] md:py-20">
        <img
          src={CLUB_PHOTO}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_65%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-navy/60" aria-hidden />
        <header className="relative mx-auto max-w-2xl text-center text-white">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-aqua">
            {t("portafolio.membership.eyebrow")}
          </p>
          <h2 id="membership-teaser-heading" className="mt-3 text-balance font-display text-3xl font-bold md:text-4xl">
            {t("portafolio.membership.titleLead")}{" "}
            <em className="not-italic text-aqua">{t("portafolio.membership.titleEmphasis")}</em>
          </h2>
          <p className="mt-4 text-pretty text-white/85">{t("portafolio.membership.subtitle")}</p>
        </header>
      </div>

      <div className="container relative z-10 mx-auto -mt-16 px-4 pb-16 md:-mt-24 md:pb-20">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map(({ key, icon: Icon, href }) => {
            const isCreyentes = key === "creyentes";
            const featured = key === "residente";
            const name = isCreyentes
              ? t("portafolio.membership.creyentes")
              : t(`portafolio.membership.plans.${key}.name`);
            const who = isCreyentes
              ? t("portafolio.membership.creyentesLead")
              : t(`portafolio.membership.plans.${key}.who`);
            const price = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.price`);
            const normalPrice = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.normalPrice`);
            const period = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.period`);
            const slots = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.slots`);
            const gifts = isCreyentes
              ? (t("portafolio.membership.creyentesGifts", { returnObjects: true }) as {
                  k: string;
                  title: string;
                }[])
              : [];

            return (
              <li key={key}>
                <article
                  className={`relative flex h-full flex-col rounded-2xl border bg-card p-6 text-ink ${
                    featured ? "border-2 border-brillante" : "border-line"
                  }`}
                >
                  {featured && (
                    <p className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brillante px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
                      {t("portafolio.membership.featuredChip")}
                    </p>
                  )}
                  <Icon className="h-8 w-8 text-brillante" weight="regular" aria-hidden />
                  <h3 className="mt-4 font-display text-xl font-extrabold text-navy">{name}</h3>
                  <p className="mt-2 flex-1 text-pretty text-sm text-muted-foreground">{who}</p>
                  {normalPrice && (
                    <p className="mt-3 font-mono text-xs text-muted-foreground line-through">{normalPrice}</p>
                  )}
                  {price && (
                    <p className="font-display text-3xl font-extrabold text-brillante">{price}</p>
                  )}
                  {period && <p className="font-mono text-[10px] text-muted-foreground">{period}</p>}
                  {slots && (
                    <p className="mt-2 self-start rounded-full bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-azul">
                      {slots}
                    </p>
                  )}
                  {isCreyentes && (
                    <ul className="mt-4 space-y-1 font-mono text-xs uppercase tracking-wide text-brillante">
                      {gifts.map((gift) => (
                        <li key={gift.k}>{gift.k}</li>
                      ))}
                    </ul>
                  )}
                  <Button asChild className="mt-6 w-full">
                    <Link to={href}>{t("portafolio.hero.ctaMemberships")}</Link>
                  </Button>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
