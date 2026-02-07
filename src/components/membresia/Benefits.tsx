import { useTranslation } from "react-i18next";
import { Users, Ticket, Handshake, MapPin, Megaphone, Network } from "lucide-react";

export function Benefits() {
  const { t } = useTranslation();
  
  const benefits = [
    {
      icon: Users,
      title: t("membresia.benefits.community.title"),
      description: t("membresia.benefits.community.description"),
    },
    {
      icon: Ticket,
      title: t("membresia.benefits.events.title"),
      description: t("membresia.benefits.events.description"),
    },
    {
      icon: Handshake,
      title: t("membresia.benefits.allies.title"),
      description: t("membresia.benefits.allies.description"),
    },
    {
      icon: MapPin,
      title: t("membresia.benefits.spaces.title"),
      description: t("membresia.benefits.spaces.description"),
    },
    {
      icon: Megaphone,
      title: t("membresia.benefits.opportunities.title"),
      description: t("membresia.benefits.opportunities.description"),
    },
    {
      icon: Network,
      title: t("membresia.benefits.visibility.title"),
      description: t("membresia.benefits.visibility.description"),
    },
  ];
  
  return (
    <section id="beneficios" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              {t("membresia.benefits.title")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="space-y-4 rounded-lg border border-border dark:border-border/80 bg-card dark:bg-card/50 p-6 transition-shadow hover:shadow-md dark:hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 dark:bg-accent/20">
                    <Icon className="h-6 w-6 text-accent dark:text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground dark:text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground dark:text-foreground/80">{benefit.description}</p>
                </div>
              );
            })}
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm italic text-muted-foreground">
              {t("membresia.benefits.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
