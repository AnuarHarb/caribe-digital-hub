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
            {t("portafolio.membership.title")}
          </h2>
          <p className="mt-4 text-pretty text-white/85">{t("portafolio.membership.subtitle")}</p>
        </header>
      </div>

      <div className="container relative z-10 mx-auto -mt-16 px-4 pb-16 md:-mt-24 md:pb-20">
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map(({ key, icon: Icon, href }) => {
            const isCreyentes = key === "creyentes";
            const name = isCreyentes
              ? t("portafolio.membership.creyentes")
              : t(`portafolio.membership.plans.${key}.name`);
            const price = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.price`);
            const period = isCreyentes ? "" : t(`portafolio.membership.plans.${key}.period`);
            const slots = key === "residente" ? t("portafolio.membership.plans.residente.slots") : "";
            const gifts = isCreyentes
              ? (t("portafolio.membership.creyentesGifts", { returnObjects: true }) as {
                  title: string;
                  why: string;
                }[])
              : [];
            const benefits = isCreyentes
              ? []
              : (t(`portafolio.membership.plans.${key}.benefits`, { returnObjects: true }) as string[]);

            return (
              <li key={key}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6 text-ink">
                  <Icon className="h-8 w-8 text-brillante" weight="regular" aria-hidden />
                  <h3 className="mt-4 font-display text-xl font-extrabold text-navy">{name}</h3>
                  {isCreyentes && (
                    <p className="mt-2 text-pretty text-sm text-muted-foreground">
                      {t("portafolio.membership.creyentesLead")}
                    </p>
                  )}
                  {price && (
                    <p className="mt-2 font-mono text-2xl text-brillante">
                      {price}
                      <span className="text-base text-muted-foreground">{period}</span>
                    </p>
                  )}
                  {slots && <p className="chip-space mt-2">{slots}</p>}
                  {isCreyentes ? (
                    <dl className="mt-4 flex-1 space-y-4">
                      {gifts.map((gift) => (
                        <div key={gift.title}>
                          <dt className="font-display font-extrabold text-navy">{gift.title}</dt>
                          <dd className="mt-1 text-pretty text-sm text-muted-foreground">{gift.why}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <ul className="mt-4 flex-1 space-y-2">
                      {benefits.map((benefit) => (
                        <li key={benefit} className="flex gap-2 text-sm text-muted-foreground">
                          <span className="text-aqua" aria-hidden>
                            →
                          </span>
                          {benefit}
                        </li>
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
