import { useTranslation } from "react-i18next";

const REASONS = [
  {
    key: "talent",
    src: "/events/hackaton-bquilla-2026-comunidad.jpg",
    rotate: "-rotate-2",
  },
  {
    key: "house",
    src: "/sede/formacion.jpg",
    rotate: "rotate-2",
    reverse: true,
  },
  {
    key: "lives",
    src: "/FCA-fundacion/tech-nights.jpg",
    rotate: "-rotate-1",
  },
] as const;

export function ConocenosWhy() {
  const { t } = useTranslation();

  return (
    <section id="porque" aria-labelledby="porque-heading" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-brillante">
            {t("why.eyebrow")}
          </p>
          <h2
            id="porque-heading"
            className="mt-3 text-balance font-display text-3xl font-bold text-navy md:text-4xl dark:text-primary"
          >
            {t("why.title")}
          </h2>
          <a
            href="https://www.codigoabierto.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex flex-col items-center gap-3"
          >
            <img
              src="/logos/fca-black.png"
              alt="Fundación Código Abierto"
              className="h-12 w-auto object-contain dark:hidden"
            />
            <img
              src="/logos/logo-fca.webp"
              alt=""
              aria-hidden
              className="hidden h-12 w-auto object-contain dark:block"
            />
            <span className="text-pretty text-sm text-muted-foreground">{t("why.operatedBy")}</span>
          </a>
          <p className="mt-5 text-pretty text-muted-foreground">{t("why.lead")}</p>
        </header>

        <div className="mx-auto mt-14 max-w-5xl space-y-16">
          {REASONS.map((reason) => (
            <article
              key={reason.key}
              className={`grid items-center gap-8 md:grid-cols-2 ${reason.reverse ? "md:[&>figure]:order-2" : ""}`}
            >
              <figure className={`overflow-hidden rounded-[2rem] border border-line ${reason.rotate}`}>
                <img
                  src={reason.src}
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </figure>
              <div>
                <h3 className="text-balance font-display text-2xl font-bold text-navy dark:text-primary">
                  {t(`why.${reason.key}.title`)}
                </h3>
                <p className="mt-3 text-pretty text-muted-foreground">
                  {t(`why.${reason.key}.text`)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
