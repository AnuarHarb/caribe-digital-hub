import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type PlanType = "community" | "builder" | "company" | "enterprise";

interface PlansProps {
  onPlanSelect: (plan: PlanType) => void;
}

export function Plans({ onPlanSelect }: PlansProps) {
  const { t } = useTranslation();
  
  const plans = [
    {
      id: "community" as PlanType,
      name: t("membresia.plans.community.name"),
      price: t("membresia.plans.community.price"),
      period: t("membresia.plans.community.period"),
      for: t("membresia.plans.community.for"),
      popular: false,
      benefits: t("membresia.plans.community.benefits", { returnObjects: true }) as string[],
      cta: t("membresia.plans.community.cta"),
    },
    {
      id: "builder" as PlanType,
      name: t("membresia.plans.builder.name"),
      price: t("membresia.plans.builder.price"),
      period: t("membresia.plans.builder.period"),
      for: t("membresia.plans.builder.for"),
      popular: true,
      benefits: t("membresia.plans.builder.benefits", { returnObjects: true }) as string[],
      cta: t("membresia.plans.builder.cta"),
    },
    {
      id: "company" as PlanType,
      name: t("membresia.plans.company.name"),
      price: t("membresia.plans.company.price"),
      period: t("membresia.plans.company.period"),
      subtitle: t("membresia.plans.company.subtitle"),
      for: t("membresia.plans.company.for"),
      popular: false,
      benefits: t("membresia.plans.company.benefits", { returnObjects: true }) as string[],
      cta: t("membresia.plans.company.cta"),
    },
  ];
  
  return (
    <section id="planes" className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              {t("membresia.plans.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t("membresia.plans.subtitle")}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col transition-all hover:shadow-lg",
                  plan.popular && "border-2 border-accent shadow-lg scale-105 md:scale-105",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground">{t("membresia.plans.builder.popular")}</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    {plan.subtitle && (
                      <p className="mt-2 text-sm text-muted-foreground">{plan.subtitle}</p>
                    )}
                  </div>
                  <CardDescription className="mt-4 text-sm">{plan.for}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => onPlanSelect(plan.id)}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Enterprise Callout */}
          <Card className="border-2 border-accent/50 dark:border-accent bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/10 dark:from-primary/20 dark:via-secondary/30 dark:to-accent/20">
            <CardHeader>
              <CardTitle className="text-2xl">{t("membresia.plans.enterprise.title")}</CardTitle>
              <CardDescription className="text-base dark:text-foreground/80">
                {t("membresia.plans.enterprise.description")}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button onClick={() => onPlanSelect("enterprise")} variant="outline" className="w-full md:w-auto border-2 dark:border-accent/50">
                {t("membresia.plans.enterprise.cta")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
