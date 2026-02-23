import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import {
  Building2,
  FileText,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const STEPS_ICONS = [Building2, FileText, Users, BarChart3];

export default function ForCompanies() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const steps = t("forCompanies.steps", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  const benefits = t("forCompanies.benefits.items", {
    returnObjects: true,
  }) as string[];

  const createCompanyLink = isAuthenticated
    ? "/dashboard/empresa"
    : "/auth?type=company";

  const createJobLink = isAuthenticated
    ? "/dashboard/empleos/nuevo"
    : "/auth?type=company";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary py-20 md:py-28">
          <div className="absolute inset-0 opacity-10" aria-hidden>
            <div className="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-accent/30" />
            <div className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-accent/20" />
          </div>
          <div className="container relative z-10 mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium text-primary-foreground">
              <Building2 className="h-4 w-4" />
              {t("forCompanies.badge")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
              {t("forCompanies.heroTitle")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
              {t("forCompanies.heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={createCompanyLink}>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
                >
                  <Building2 className="h-5 w-5" />
                  {t("forCompanies.ctaCreateCompany")}
                </Button>
              </Link>
              <Link to={createJobLink}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  <FileText className="h-5 w-5" />
                  {t("forCompanies.ctaPostJob")}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How it works - Steps */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-display text-3xl font-bold text-primary md:text-4xl">
              {t("forCompanies.stepsTitle")}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              {t("forCompanies.stepsSubtitle")}
            </p>
            <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => {
                const Icon = STEPS_ICONS[i] ?? CheckCircle2;
                return (
                  <div
                    key={i}
                    className="group relative rounded-xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20 font-display text-lg font-bold text-accent">
                        {i + 1}
                      </span>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="mt-6 font-display text-lg font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-muted/50 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-display text-3xl font-bold text-primary md:text-4xl">
                {t("forCompanies.benefits.title")}
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                {t("forCompanies.benefits.subtitle")}
              </p>
              <ul className="mt-12 space-y-4">
                {benefits.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              {t("forCompanies.bottomCta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              {t("forCompanies.bottomCta.subtitle")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to={createCompanyLink}>
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <Building2 className="h-5 w-5" />
                  {t("forCompanies.ctaCreateCompany")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={createJobLink}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                >
                  <FileText className="h-5 w-5" />
                  {t("forCompanies.ctaPostJob")}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
