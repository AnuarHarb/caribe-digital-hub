import { useEffect } from "react";
import { CaretDown } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

type Item = { q: string; a: string };

export function ConocenosFAQ() {
  const { t, i18n } = useTranslation();
  const items = t("faq.items", { returnObjects: true }) as Item[];
  const list = Array.isArray(items) ? items : [];

  useEffect(() => {
    const scriptId = "conocenos-faq-structured-data";
    document.getElementById(scriptId)?.remove();
    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: list.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    });
    document.head.appendChild(script);
    return () => document.getElementById(scriptId)?.remove();
  }, [i18n.language]);

  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-24 py-16 md:py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <header className="text-center">
          <h2
            id="faq-heading"
            className="text-balance font-display text-3xl font-bold text-navy md:text-4xl dark:text-primary"
          >
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-pretty text-muted-foreground">{t("faq.subtitle")}</p>
        </header>

        <div className="mt-10">
          {list.map((item, i) => (
            <details
              key={item.q}
              className="group border-b border-line py-1"
              defaultOpen={i === 0}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-lg font-bold text-navy [&::-webkit-details-marker]:hidden dark:text-primary">
                <span className="text-pretty">{item.q}</span>
                <CaretDown
                  className="h-5 w-5 shrink-0 text-brillante transition-transform group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="pb-5 text-pretty text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
