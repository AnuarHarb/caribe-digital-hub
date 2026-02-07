import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, Rocket, Building2, ArrowRightLeft } from "lucide-react";

export function ForWho() {
  const { t } = useTranslation();
  
  const personas = [
    {
      icon: Code2,
      title: t("membresia.forWho.developers.title"),
      description: t("membresia.forWho.developers.description"),
    },
    {
      icon: Rocket,
      title: t("membresia.forWho.founders.title"),
      description: t("membresia.forWho.founders.description"),
    },
    {
      icon: Building2,
      title: t("membresia.forWho.companies.title"),
      description: t("membresia.forWho.companies.description"),
    },
    {
      icon: ArrowRightLeft,
      title: t("membresia.forWho.transition.title"),
      description: t("membresia.forWho.transition.description"),
    },
  ];
  
  return (
    <section id="para-quien" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              {t("membresia.forWho.title")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {personas.map((persona, index) => {
              const Icon = persona.icon;
              return (
                <Card key={index} className="transition-shadow hover:shadow-lg dark:bg-card/50 dark:border-border/80">
                  <CardHeader>
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 dark:bg-accent/20">
                      <Icon className="h-6 w-6 text-accent dark:text-accent" />
                    </div>
                    <CardTitle className="text-xl dark:text-foreground">{persona.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base dark:text-foreground/80">{persona.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
