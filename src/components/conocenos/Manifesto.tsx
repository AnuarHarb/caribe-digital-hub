import { CaretDown } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type Section = {
  title: string;
  paragraphs: string[];
  items?: string[];
};

const PHOTOS = [
  "/events/hackaton-bquilla-2026-comunidad.jpg",
  "/FCA-fundacion/tech-nights-2.jpg",
  "/FCA-fundacion/barranqui-ia.jpg",
  "/FCA-fundacion/tech-caribe.jpg",
];

export function ConocenosManifesto() {
  const { t } = useTranslation();
  const sections = t("manifesto.sections", { returnObjects: true }) as Section[];

  return (
    <section
      id="manifiesto"
      aria-labelledby="manifiesto-heading"
      className="scroll-mt-24 overflow-hidden bg-navy py-16 text-white md:py-24"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-[11rem_minmax(0,40rem)_11rem]">
          <aside className="hidden lg:flex lg:flex-col lg:gap-10 lg:pt-28" aria-hidden>
            <img
              src={PHOTOS[0]}
              alt=""
              className="aspect-[3/4] w-full rotate-[-8deg] rounded-[1.75rem] object-cover"
            />
            <img
              src={PHOTOS[2]}
              alt=""
              className="aspect-[3/4] w-[85%] rotate-[6deg] self-end rounded-[1.75rem] object-cover"
            />
          </aside>

        <div>
          <header>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-aqua">
              {t("manifesto.eyebrow")}
            </p>
            <h1
              id="manifiesto-heading"
              className="mt-3 text-balance font-display text-4xl font-extrabold md:text-5xl"
            >
              {t("manifesto.heading")}
            </h1>
          </header>

          <div className="mt-8 flex gap-3 overflow-x-auto pb-2 lg:hidden">
            {PHOTOS.map((photo) => (
              <img
                key={photo}
                src={photo}
                alt=""
                aria-hidden
                className="h-24 w-32 shrink-0 rounded-3xl object-cover"
              />
            ))}
          </div>

          <div className="mt-8">
            {Array.isArray(sections) &&
              sections.map((section, i) => (
                <details
                  key={section.title}
                  className="group border-b border-white/15 py-1"
                  defaultOpen={i === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-mono text-sm uppercase tracking-wide text-aqua [&::-webkit-details-marker]:hidden">
                    <span className="text-pretty">{section.title}</span>
                    <CaretDown
                      className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180"
                      aria-hidden
                    />
                  </summary>
                  <div className="space-y-4 pb-6">
                    {section.paragraphs?.map((p) => (
                      <p key={p} className="text-pretty text-white/85">
                        {p}
                      </p>
                    ))}
                    {section.items && (
                      <ul className="space-y-3">
                        {section.items.map((item) => (
                          <li key={item} className="text-pretty text-white/85">
                            <span className="mr-2 text-aqua" aria-hidden>
                              →
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </details>
              ))}
          </div>
        </div>

          <aside className="hidden lg:flex lg:flex-col lg:gap-10 lg:pt-16" aria-hidden>
            <img
              src={PHOTOS[1]}
              alt=""
              className="aspect-[3/4] w-full rotate-[7deg] rounded-[1.75rem] object-cover"
            />
            <img
              src={PHOTOS[3]}
              alt=""
              className="aspect-[3/4] w-[90%] rotate-[-5deg] self-start rounded-[1.75rem] object-cover"
            />
          </aside>
        </div>
      </div>
    </section>
  );
}
