import { useTranslation } from "react-i18next";

export function WhatIs() {
  const { t } = useTranslation();
  
  return (
    <section id="que-es" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
            {t("membresia.whatIs.title")}
          </h2>
          <p className="text-lg text-foreground md:text-xl">
            {t("membresia.whatIs.description")}
          </p>
          <p className="text-sm text-muted-foreground italic">
            {t("membresia.whatIs.footnote")}
          </p>
        </div>
      </div>
    </section>
  );
}
