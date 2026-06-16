import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { GraduationCap, Building2, Rocket, TrendingUp, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AudienceItem {
  title: string;
  text: string;
  cta: string;
}

interface AudienceLink {
  icon: LucideIcon;
  href: string;
  external?: boolean;
}

const LINKS: AudienceLink[] = [
  { icon: GraduationCap, href: "https://techcentre.co", external: true },
  { icon: Building2, href: "https://ciudadinmersiva.com", external: true },
  { icon: Rocket, href: "/auth" },
  { icon: TrendingUp, href: "mailto:hola@costadigital.org", external: true },
];

export function Audiences() {
  const { t } = useTranslation();
  const items = t("landing.audiences.items", { returnObjects: true }) as AudienceItem[];

  return (
    <section
      aria-labelledby="audiences-heading"
      className="bg-muted/30 py-20 md:py-28"
    >
      <div className="container mx-auto px-4">
        <h2
          id="audiences-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.audiences.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          {t("landing.audiences.subtitle")}
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const link = LINKS[i] ?? LINKS[0];
            const Icon = link.icon;
            const button = (
              <Button variant="ghost" className="mt-4 gap-1 px-0 text-accent hover:bg-transparent hover:text-accent">
                {item.cta}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            );
            return (
              <article
                key={item.title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {item.text}
                </p>
                {link.external ? (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {button}
                  </a>
                ) : (
                  <Link to={link.href}>{button}</Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
