import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Rocket, Handshake, DollarSign } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ListCard {
  key: string;
  icon: LucideIcon;
}

const LIST_CARDS: ListCard[] = [
  { key: "create", icon: Rocket },
  { key: "founders", icon: Handshake },
  { key: "investment", icon: DollarSign },
];

const ECOSYSTEM_MAP_URL = "https://shelv.io/";
const CARIBE_VENTURES_URL = "https://caribe.ventures";
const SYNERGY_URL = "https://www.snrg.lat/inicio";
const BARRANQUI_IA_URL = "https://barranquiia.com";

export function StartupsSection() {
  const { t } = useTranslation();

  return (
    <section
      aria-labelledby="startups-heading"
      className="overflow-x-hidden py-20 md:py-28"
    >
      <div className="container mx-auto min-w-0 px-4">
        <h2
          id="startups-heading"
          className="text-center font-display text-3xl font-bold text-primary md:text-4xl"
        >
          {t("landing.startups.title")}
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-center text-muted-foreground">
          {t("landing.startups.subtitle")}
        </p>

        <div className="mt-12 grid min-w-0 gap-6 lg:grid-cols-2 lg:items-stretch">
          {/* Left: Map card */}
          <Card className="flex min-w-0 flex-col overflow-hidden transition-all duration-300 hover:border-accent/30 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="font-display text-xl">
                {t("landing.startups.map.title")}
              </CardTitle>
              <p className="mt-2 text-muted-foreground">
                {t("landing.startups.map.description")}
              </p>
            </CardHeader>
            <CardContent className="flex min-w-0 flex-1 flex-col">
              <div className="min-h-[240px] w-full max-w-full overflow-hidden rounded-lg bg-muted/50 border border-border/50 aspect-video">
                <img
                  src="/events/screenshot-shelv.png"
                  alt=""
                  className="h-full w-full max-w-full object-cover rounded-lg opacity-90"
                  loading="lazy"
                  aria-hidden
                />
              </div>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                <img
                  src="/logos/shelv.png"
                  alt="Shelv"
                  className="h-10 w-auto object-contain opacity-80"
                />
                <a
                  href={ECOSYSTEM_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="transition-colors">
                    {t("landing.startups.map.cta")}
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Right: 3 cards stacked vertically */}
          <div className="flex min-w-0 flex-col gap-6">
            {LIST_CARDS.map((card) => {
              const Icon = card.icon;
              const isInvestment = card.key === "investment";
              const isFounders = card.key === "founders";
              const isCreate = card.key === "create";
              const cardContent = (
                <>
                  {!isInvestment && !isFounders && !isCreate && (
                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-accent">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <CardTitle className="font-display text-lg">
                        {t(`landing.startups.${card.key}.title`)}
                      </CardTitle>
                    </CardHeader>
                  )}
                  <CardContent className={isInvestment || isFounders || isCreate ? "pt-6" : undefined}>
                    {(isInvestment || isFounders || isCreate) && (
                      <Badge variant="secondary" className="mb-3">
                        {t(`landing.startups.${card.key}.chip`)}
                      </Badge>
                    )}
                    {isInvestment ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="shrink-0">
                          <img
                            src="/logos/caribe-ventures-black.png"
                            alt="Caribe Ventures"
                            className="h-14 w-auto object-contain dark:hidden md:h-16"
                          />
                          <img
                            src="/logos/caribe-ventures-white.png"
                            alt="Caribe Ventures"
                            className="hidden h-14 w-auto object-contain dark:block md:h-16"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("landing.startups.investment.description1")}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("landing.startups.investment.description2")}
                          </p>
                        </div>
                      </div>
                    ) : isCreate ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="flex shrink-0 items-center justify-center p-2">
                          <img
                            src="/logos/barranqui-ia.png"
                            alt="Barranqui-IA"
                            className="h-6 w-auto object-contain md:h-8"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("landing.startups.create.description1")}
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t("landing.startups.create.description2")}
                          </p>
                        </div>
                      </div>
                    ) : isFounders ? (
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="shrink-0">
                          <img
                            src="/logos/synergy.png"
                            alt="Synergy"
                            className="h-14 w-auto object-contain dark:invert md:h-16"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed flex-1 min-w-0">
                          {t("landing.startups.founders.description")}
                        </p>
                      </div>
                    ) : (
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {(
                          t(`landing.startups.${card.key}.items`, {
                            returnObjects: true,
                          }) as string[]
                        ).map((item) => (
                          <li key={item} className="flex gap-2">
                            <span className="text-accent" aria-hidden>•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </>
              );

              return isInvestment ? (
                <a
                  key={card.key}
                  href={CARIBE_VENTURES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="transition-all duration-300 hover:border-accent/30 hover:shadow-lg cursor-pointer">
                    {cardContent}
                  </Card>
                </a>
              ) : isFounders ? (
                <a
                  key={card.key}
                  href={SYNERGY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="transition-all duration-300 hover:border-accent/30 hover:shadow-lg cursor-pointer">
                    {cardContent}
                  </Card>
                </a>
              ) : isCreate ? (
                <a
                  key={card.key}
                  href={BARRANQUI_IA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="transition-all duration-300 hover:border-accent/30 hover:shadow-lg cursor-pointer">
                    {cardContent}
                  </Card>
                </a>
              ) : (
                <Card
                  key={card.key}
                  className="transition-all duration-300 hover:border-accent/30 hover:shadow-lg"
                >
                  {cardContent}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
