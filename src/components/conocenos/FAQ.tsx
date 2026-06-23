import { useState, useEffect, type ReactNode } from "react";
import { Search, ChevronDown } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string | ReactNode;
  answerText: string;
}

const faqsData: FAQItem[] = [
  {
    question: "¿Qué es Costa Digital?",
    answerText:
      "Costa Digital es el movimiento y cluster tecnológico del Caribe colombiano, impulsado por Fundación Código Abierto. Articula comunidades, universidades, empresas, gobierno y startups bajo una misma bandera para convertir al Caribe en el nuevo epicentro tech de Colombia.",
    answer:
      "Costa Digital es el movimiento y cluster tecnológico del Caribe colombiano, impulsado por Fundación Código Abierto. Articula comunidades, universidades, empresas, gobierno y startups bajo una misma bandera para convertir al Caribe en el nuevo epicentro tech de Colombia.",
  },
  {
    question: "¿Qué es Fundación Código Abierto (FCA)?",
    answerText:
      "Fundación Código Abierto (FCA) es la institución que da origen e impulsa a Costa Digital. Trabaja en educación especializada, desarrollo comunitario, programas de innovación y acceso a capital para convertir al Caribe colombiano en un epicentro de innovación y tecnología.",
    answer:
      "Fundación Código Abierto (FCA) es la institución que da origen e impulsa a Costa Digital. Trabaja en educación especializada, desarrollo comunitario, programas de innovación y acceso a capital para convertir al Caribe colombiano en un epicentro de innovación y tecnología.",
  },
  {
    question: "¿Cuál es la misión del movimiento?",
    answerText:
      "Potenciar el talento del Caribe y demostrar que desde esta región se pueden crear soluciones tecnológicas de impacto global. Creemos que la tecnología es la industria de las oportunidades y queremos que cada persona, empresa e institución de la región haga parte de esta revolución.",
    answer:
      "Potenciar el talento del Caribe y demostrar que desde esta región se pueden crear soluciones tecnológicas de impacto global. Creemos que la tecnología es la industria de las oportunidades y queremos que cada persona, empresa e institución de la región haga parte de esta revolución.",
  },
  {
    question: "¿Qué tipo de eventos organizan?",
    answerText:
      "Tech Nights, Barranqui-IA, TechCaribe Fest, DevFest Barranquilla, meetups, ferias y convocatorias.",
    answer: (
      <>
        <p className="mb-2">
          Organizamos y apoyamos eventos que conectan el ecosistema tech
          regional, como:
        </p>
        <ul className="mb-2 list-inside list-disc space-y-1">
          <li>Tech Nights: encuentros sobre IA, innovación y networking.</li>
          <li>
            Barranqui-IA: el hackatón de inteligencia artificial más grande del
            Caribe.
          </li>
          <li>
            TechCaribe Fest: el festival de tecnología y emprendimiento más
            importante de la región.
          </li>
          <li>DevFest Barranquilla: evento oficial de Google Developers Group.</li>
        </ul>
        <p className="mb-2">
          Además, apoyamos meetups, ferias, conferencias y convocatorias que
          impulsen la innovación.
        </p>
      </>
    ),
  },
  {
    question: "¿Cómo puedo unirme o colaborar?",
    answerText:
      "Estudiando en Tech Centre, como voluntario o mentor, como aliado o patrocinador, o como startup participando en programas.",
    answer: (
      <>
        <p className="mb-2">Puedes participar de muchas formas:</p>
        <ul className="mb-2 list-inside list-disc space-y-1">
          <li>
            Estudiando: inscríbete en los diplomados o cursos cortos de Tech
            Centre.
          </li>
          <li>
            Como voluntario o mentor: súmate a las comunidades y eventos del
            ecosistema.
          </li>
          <li>
            Como aliado o patrocinador: apoya el crecimiento del ecosistema tech
            regional.
          </li>
          <li>
            Como startup: participa en programas de incubación y conexiones con
            inversionistas de Caribe Ventures.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "¿Qué relación tienen con la inversión y el capital?",
    answerText:
      "A través de Caribe Ventures, el pilar de capital del ecosistema, conectamos inversionistas y startups tecnológicas de la región, canalizando capital inteligente hacia proyectos con potencial de impacto.",
    answer:
      "A través de Caribe Ventures, el pilar de capital del ecosistema, conectamos inversionistas y startups tecnológicas de la región, canalizando capital inteligente hacia proyectos con potencial de impacto para escalar desde el Caribe hacia el mundo.",
  },
  {
    question: "¿Cómo apoyan la innovación?",
    answerText:
      "A través de Ciudad Inmersiva, nuestro laboratorio de innovación tecnológica, ayudamos a empresas y organizaciones a resolver desafíos reales con IA, software y tecnologías emergentes.",
    answer:
      "A través de Ciudad Inmersiva, nuestro laboratorio de innovación tecnológica, ayudamos a empresas y organizaciones a resolver desafíos reales con inteligencia artificial, software y tecnologías emergentes, trabajando con equipos locales de alto nivel técnico.",
  },
  {
    question: "¿Por qué apoyar la causa?",
    answerText:
      "Porque cada beca, evento o programa cambia vidas. Más de 100 personas formadas con nosotros hoy trabajan en tecnología, y cientos de jóvenes, emprendedores y empresas han encontrado un espacio para crecer.",
    answer:
      "Porque cada beca, evento o programa cambia vidas. Más de 100 personas formadas con nosotros hoy trabajan en tecnología, y cientos de jóvenes, emprendedores y empresas han encontrado un espacio para crecer y conectar. Apoyarnos es invertir en el futuro digital del Caribe.",
  },
  {
    question: "¿Quién está detrás de Costa Digital y FCA?",
    answerText:
      "Anuar Harb y Grace Torres son los cofundadores. Anuar sostiene la visión y lidera la transformación del Caribe como General Partner de Caribe Ventures; Grace, directora de operaciones, abogada y directora del Tech Centre, hace que todo esté en orden y suceda como debe.",
    answer: (
      <>
        <p className="mb-2">
          Detrás de este movimiento están Anuar Harb y Grace Torres, cofundadores
          que decidieron transformar la historia tecnológica del Caribe
          colombiano.
        </p>
        <p className="mb-2">
          Anuar es desarrollador de software, líder del Google Developer Group
          Barranquilla y fundador de Fundación Código Abierto. Es quien sostiene
          la visión y lidera la transformación del Caribe en el nuevo epicentro
          tech, y como General Partner de Caribe Ventures impulsa el capital del
          ecosistema.
        </p>
        <p className="mb-2">
          Grace es cofundadora, directora de operaciones y abogada, y directora
          del Tech Centre. Es quien hace que todo esté en orden y que las cosas
          sucedan como deben suceder, convirtiendo la visión en realidad cada
          día.
        </p>
        <p className="mb-2">
          Juntos lideran la visión de convertir al Caribe en el nuevo epicentro
          tech de Colombia, uniendo educación, comunidad, innovación y capital
          bajo una misma bandera: Costa Digital.
        </p>
      </>
    ),
  },
];

interface FAQProps {
  backgroundColor?: string;
  title?: string;
}

export function ConocenosFAQ({
  backgroundColor = "bg-blue-50 dark:bg-blue-950/20",
  title = "Preguntas Frecuentes",
}: FAQProps) {
  const faqs = faqsData;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answerText,
        },
      })),
    };

    const scriptId = "conocenos-faq-structured-data";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.id = scriptId;
    script.type = "application/ld+json";
    script.text = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    return () => {
      const s = document.getElementById(scriptId);
      if (s) s.remove();
    };
  }, [faqs]);

  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerText.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      className={backgroundColor}
      itemScope
      itemType="https://schema.org/FAQPage"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-14">
        <div className="flex flex-col gap-6">
          <header className="mb-4 text-center">
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="text-muted-foreground">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </header>

          <div className="relative mx-auto w-full max-w-2xl">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Buscar preguntas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar preguntas"
              className="w-full rounded-lg border border-border bg-background py-3 pl-12 pr-4 transition focus:border-transparent focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {filteredFAQs.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>No se encontraron preguntas que coincidan con tu búsqueda.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => {
                const originalIndex = faqs.indexOf(faq);
                const isOpen = openIndex === originalIndex;

                return (
                  <article
                    key={originalIndex}
                    className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md"
                    itemScope
                    itemType="https://schema.org/Question"
                  >
                    <button
                      onClick={() => toggleFAQ(originalIndex)}
                      className="flex w-full items-center justify-between rounded-lg px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500"
                      aria-expanded={isOpen}
                      type="button"
                    >
                      <h3
                        className="flex-1 pr-4 text-lg font-semibold text-foreground md:text-xl"
                        itemProp="name"
                      >
                        {faq.question}
                      </h3>
                      <span
                        aria-hidden="true"
                        className={`flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="h-5 w-5" />
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[1000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                      itemScope
                      itemType="https://schema.org/Answer"
                    >
                      <div className="px-6 pb-5 pt-0">
                        <div
                          className="leading-relaxed text-foreground/80"
                          itemProp="text"
                        >
                          {typeof faq.answer === "string" ? (
                            <p>{faq.answer}</p>
                          ) : (
                            faq.answer
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {searchQuery && filteredFAQs.length > 0 && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando {filteredFAQs.length} de {faqs.length} preguntas
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
