import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { DESCRIPTOR, PRODUCTS } from "@/content/portafolio";
import { CheckoutButton, CreyentesWall } from "@/components/portafolio/MembershipBlocks";
import { useMembership } from "@/hooks/useMembership";
import { useTranslation } from "react-i18next";
import { waLink } from "@/lib/waLink";
import { formatCop } from "@/lib/formatPrice";
import { WhatsappLogo } from "@phosphor-icons/react";

const PAY = {
  miembro: { monthly: "miembro_mensual", annual: "miembro_anual" },
  residente: { monthly: "residente_mensual", annual: "residente_anual" },
} as const;

export default function Membresias() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const { data: membership } = useMembership();

  const gifts = t("portafolio.membership.creyentesGifts", { returnObjects: true }) as {
    k: string;
    title: string;
    why: string;
  }[];
  const onlyItems = t("portafolio.membership.onlyItems", { returnObjects: true }) as {
    k: string;
    title: string;
    text: string;
  }[];
  const foodItems = t("portafolio.membership.foodItems", { returnObjects: true }) as {
    k: string;
    title: string;
    text: string;
    price: string;
  }[];
  const howRows = t("portafolio.membership.howRows", { returnObjects: true }) as {
    ic: string;
    text: string;
  }[];
  const tyc = t("portafolio.membership.tyc", { returnObjects: true }) as string[];

  const planLabel = membership
    ? t(`portafolio.membership.plans.${membership.plan}.name`)
    : "";

  return (
    <div className="min-h-screen bg-paper">
      <SEOHead
        title={`Membresías | ${DESCRIPTOR}`}
        description={t("portafolio.membership.subtitle")}
        canonical="/membresias"
      />
      <Navbar />
      <main>
        <header className="relative overflow-hidden bg-navy px-6 py-12 text-white md:px-12 md:py-16">
          <div
            className="pointer-events-none absolute -right-24 -top-36 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(46,77,184,.55),transparent_62%)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-5xl">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-aqua">
              {t("portafolio.membership.eyebrow")}
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold tracking-tight md:text-5xl">
              {t("portafolio.membership.titleLead")}{" "}
              <em className="not-italic text-aqua">{t("portafolio.membership.titleEmphasis")}</em>
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-white/80">
              {t("portafolio.membership.subtitle")}
            </p>
            {membership && (
              <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 font-mono text-sm text-aqua">
                {t("portafolio.membership.activeBanner", {
                  plan: planLabel,
                  date: new Date(membership.ends_at).toLocaleDateString(locale === "en" ? "en-US" : "es-CO"),
                })}
              </p>
            )}
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-6 py-10 md:px-12">
          <section id="niveles" aria-labelledby="levels-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.levelsEyebrow")}
            </p>
            <h2 id="levels-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.levelsTitle")}
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {(["miembro", "residente"] as const).map((key) => {
                const plan = t(`portafolio.membership.plans.${key}`, { returnObjects: true }) as {
                  name: string;
                  who: string;
                  price: string;
                  normalPrice: string;
                  period: string;
                  slots: string;
                  benefits: string[];
                };
                const featured = key === "residente";
                const already = membership?.plan === key;
                return (
                  <article
                    key={key}
                    id={key}
                    className={`relative flex flex-col rounded-2xl border bg-white p-5 ${
                      featured ? "border-2 border-brillante" : "border-line"
                    }`}
                  >
                    {featured && (
                      <p className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brillante px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white">
                        {t("portafolio.membership.featuredChip")}
                      </p>
                    )}
                    <h3 className="font-display text-xl font-extrabold text-navy">{plan.name}</h3>
                    <p className="mt-1 min-h-12 text-sm text-muted-foreground">{plan.who}</p>
                    <p className="mt-3 font-mono text-xs text-muted-foreground line-through">{plan.normalPrice}</p>
                    <p className="font-display text-3xl font-extrabold text-brillante">{plan.price}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{plan.period}</p>
                    <p className="mt-2 self-start rounded-full bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-wide text-azul">
                      {plan.slots}
                    </p>
                    <ul className="mt-4 flex-1">
                      {plan.benefits.map((b) => (
                        <li key={b} className="border-t border-dashed border-line py-2 pl-5 text-sm text-muted-foreground first:border-t-0">
                          <span className="relative -ml-5 pr-2 font-bold text-aqua" aria-hidden>
                            →
                          </span>
                          {b}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 space-y-3">
                      {already ? (
                        <p className="text-center font-mono text-sm text-brillante">
                          {t("portafolio.membership.activeBanner", {
                            plan: plan.name,
                            date: new Date(membership!.ends_at).toLocaleDateString(
                              locale === "en" ? "en-US" : "es-CO"
                            ),
                          })}
                        </p>
                      ) : (
                        <>
                          <CheckoutButton
                            productKey={PAY[key].monthly}
                            label={t("portafolio.membership.ctaPay")}
                          />
                          <CheckoutButton
                            productKey={PAY[key].annual}
                            label={`${t("portafolio.membership.ctaAnnual")} (${formatCop(
                              PRODUCTS[PAY[key].annual].amountCop,
                              locale
                            )})`}
                          />
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-6 text-pretty text-sm text-muted-foreground">
              {t("portafolio.membership.launchNote")}
            </p>
          </section>

          <section id="creyentes" className="mt-12" aria-labelledby="creyentes-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.creyentesEyebrow")}
            </p>
            <h2 id="creyentes-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.creyentesTitle")}
            </h2>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">
              {t("portafolio.membership.creyentesLead")}
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {gifts.map((gift) => (
                <li key={gift.title} className="rounded-2xl bg-navy p-4 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-aqua">{gift.k}</p>
                  <h3 className="mt-2 font-display text-base font-bold">{gift.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{gift.why}</p>
                </li>
              ))}
            </ul>
            <CreyentesWall />
          </section>

          <section className="mt-12" aria-labelledby="only-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.onlyEyebrow")}
            </p>
            <h2 id="only-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.onlyTitle")}
            </h2>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {onlyItems.map((item) => (
                <li key={item.title} className="rounded-2xl bg-navy p-4 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-aqua">{item.k}</p>
                  <h3 className="mt-2 font-display text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="food-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.foodEyebrow")}
            </p>
            <h2 id="food-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.foodTitle")}
            </h2>
            <p className="mt-3 text-pretty text-sm text-muted-foreground">
              {t("portafolio.membership.foodLead")}
            </p>
            <ul className="mt-6 grid gap-3 md:grid-cols-3">
              {foodItems.map((item) => (
                <li key={item.title} className="rounded-2xl bg-navy p-4 text-white">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-aqua">{item.k}</p>
                  <h3 className="mt-2 font-display text-base font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-white/70">{item.text}</p>
                  <p className="mt-3 font-mono text-sm font-bold text-aqua">{item.price}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12" aria-labelledby="how-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.howEyebrow")}
            </p>
            <h2 id="how-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.howTitle")}
            </h2>
            <dl className="mt-6 divide-y divide-line rounded-2xl border border-line bg-white px-5">
              {howRows.map((row) => (
                <div key={row.ic} className="flex flex-col gap-2 py-4 md:flex-row md:gap-4">
                  <dt className="w-20 shrink-0 font-mono text-xs uppercase tracking-wide text-brillante">
                    {row.ic}
                  </dt>
                  <dd className="text-sm text-muted-foreground">{row.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="mt-12" aria-labelledby="tyc-heading">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brillante">
              {t("portafolio.membership.tycEyebrow")}
            </p>
            <h2 id="tyc-heading" className="mt-2 font-display text-2xl font-bold text-navy">
              {t("portafolio.membership.tycTitle")}
            </h2>
            <ol className="mt-6 list-decimal space-y-3 rounded-2xl border border-line bg-white px-8 py-5 text-sm text-muted-foreground">
              {tyc.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        <section className="bg-navy px-6 py-10 text-white md:px-12" aria-labelledby="cta-heading">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 id="cta-heading" className="font-display text-2xl font-extrabold">
                {t("portafolio.membership.ctaBandTitle")}{" "}
                <em className="not-italic text-aqua">{t("portafolio.membership.ctaBandEmphasis")}</em>
              </h2>
              <p className="mt-2 font-mono text-xs text-white/70">{t("portafolio.membership.ctaBandSub")}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={waLink("membresia", locale)} target="_blank" rel="noopener noreferrer">
                <Button size="lg">
                  <WhatsappLogo weight="fill" aria-hidden />
                  {t("portafolio.membership.ctaWhatsApp")}
                </Button>
              </a>
              <a href="#niveles">
                <Button size="lg" variant="secondary">
                  {t("portafolio.membership.ctaPay")}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
