import { useTranslation } from "react-i18next";
import { UserPlus, Building2 } from "lucide-react";

export function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section aria-labelledby="how-it-works-heading" className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2
          id="how-it-works-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.howItWorks.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.howItWorks.subtitle")}
        </p>
        <div className="relative mt-10 grid gap-8 md:grid-cols-2">
          {/* Connector line on desktop */}
          <div
            className="absolute left-1/2 top-1/2 hidden h-0.5 w-12 -translate-x-1/2 -translate-y-1/2 bg-accent/30 md:block"
            aria-hidden
          />
          <article
            className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-display text-lg font-bold text-accent"
                aria-hidden
              >
                1
              </span>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent transition-transform duration-300 group-hover:scale-110">
                <UserPlus className="h-6 w-6" aria-hidden />
              </div>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
              {t("landing.howItWorks.professionals.title")}
            </h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              {(t("landing.howItWorks.professionals.steps", {
                returnObjects: true,
              }) as string[]).map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </article>
          <article
            className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-display text-lg font-bold text-accent"
                aria-hidden
              >
                2
              </span>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent transition-transform duration-300 group-hover:scale-110">
                <Building2 className="h-6 w-6" aria-hidden />
              </div>
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
              {t("landing.howItWorks.companies.title")}
            </h3>
            <ul className="mt-4 space-y-3 text-muted-foreground">
              {(t("landing.howItWorks.companies.steps", {
                returnObjects: true,
              }) as string[]).map((step, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-accent">•</span>
                  {step}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
