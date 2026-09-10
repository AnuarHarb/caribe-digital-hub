import { useTranslation } from "react-i18next";

const PHOTO = "/equipo/cofundadores.jpg";

export function ConocenosTeam() {
  const { t } = useTranslation();
  const people = ["grace", "anuar"] as const;

  return (
    <section id="equipo" aria-labelledby="equipo-heading" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <header className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-brillante">
            {t("team.eyebrow")}
          </p>
          <h2
            id="equipo-heading"
            className="mt-3 text-balance font-display text-3xl font-bold text-navy md:text-4xl dark:text-primary"
          >
            {t("team.title")}
          </h2>
        </header>

        <figure className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-line">
          <img
            src={PHOTO}
            alt={t("team.photoAlt")}
            className="aspect-[16/10] w-full object-cover object-[center_30%]"
          />
        </figure>

        <div className="mx-auto mt-10 grid max-w-4xl gap-8 md:grid-cols-2">
          {people.map((key) => (
            <article key={key} className="rounded-2xl border border-line bg-card p-8">
              <h3 className="font-display text-xl font-extrabold text-navy dark:text-primary">
                {t(`team.${key}.name`)}
              </h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-wide text-brillante">
                {t(`team.${key}.role`)}
              </p>
              <p className="mt-4 text-pretty text-muted-foreground">{t(`team.${key}.bio`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
