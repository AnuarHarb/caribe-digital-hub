import { useTranslation } from "react-i18next";

export function Impact() {
  const { t } = useTranslation();
  
  return (
    <section id="impacto" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 dark:from-primary/20 dark:via-secondary/30 dark:to-accent/20 border border-accent/20 dark:border-accent/40 p-8 md:p-12 text-center space-y-4">
            <h2 className="font-display text-3xl font-bold text-primary dark:text-foreground md:text-4xl">
              {t("membresia.impact.title")}
            </h2>
            <p className="text-lg text-foreground dark:text-foreground/90 md:text-xl">
              {t("membresia.impact.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
