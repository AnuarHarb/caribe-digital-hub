import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const images = [
  {
    src: "/FCA-fundacion/tech-nights-2.jpg",
    alt: "Evento Tech Nights impulsado por Fundación Código Abierto",
  },
  {
    src: "/FCA-fundacion/barranqui-ia.jpg",
    alt: "Barranqui-IA, el hackatón de inteligencia artificial más grande del Caribe",
  },
  {
    src: "/FCA-fundacion/tech-nights.jpg",
    alt: "Tech Nights - Encuentros de innovación y networking",
  },
  {
    src: "/FCA-fundacion/tech-caribe.jpg",
    alt: "TechCaribe Fest - Festival de tecnología del Caribe",
  },
];

export function ConocenosMission() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const prevSlide = () =>
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <section
      id="mision"
      className="overflow-hidden bg-gradient-to-b from-background to-blue-50/30 pt-16 md:pt-24 dark:to-blue-950/20"
      itemScope
      itemType="https://schema.org/AboutPage"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:gap-12">
        <header className="space-y-4 text-center">
          <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Transformando el <span className="text-blue-500">Caribe</span> en el
            nuevo epicentro tech de Colombia
          </h2>
          <div className="mx-auto space-y-4">
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Fundación Código Abierto es la institución detrás de Costa Digital,
              el movimiento y clúster tecnológico que articula comunidades, talento,
              startups, educación y capital para transformar al Caribe colombiano
              en un hub tech global.
            </p>
          </div>
        </header>

        <div className="relative sm:hidden">
          <div className="overflow-hidden rounded-2xl shadow-xl">
            <div className="relative h-80 w-full">
              <img
                className="h-full w-full object-cover"
                src={images[currentSlide].src}
                alt={images[currentSlide].alt}
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
              />
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
            aria-label="Imagen anterior"
            type="button"
          >
            <ChevronLeft className="h-5 w-5 text-blue-500" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-lg transition-all hover:bg-white"
            aria-label="Siguiente imagen"
            type="button"
          >
            <ChevronRight className="h-5 w-5 text-blue-500" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? "w-8 bg-blue-500" : "w-2 bg-gray-300"
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="hidden gap-3 sm:grid sm:grid-cols-2 sm:grid-rows-[200px_200px] md:grid-cols-3 md:gap-5">
          <img
            className="h-full w-full rounded-xl object-cover sm:row-span-2"
            src="/FCA-fundacion/tech-nights-2.jpg"
            alt="Evento Tech Nights impulsado por Fundación Código Abierto"
            loading="lazy"
          />
          <img
            className="h-full w-full rounded-xl object-cover"
            src="/FCA-fundacion/barranqui-ia.jpg"
            alt="Barranqui-IA, el hackatón de inteligencia artificial más grande del Caribe"
            loading="lazy"
          />
          <img
            className="h-full w-full rounded-xl object-cover sm:col-start-3 sm:row-span-2"
            src="/FCA-fundacion/tech-nights.jpg"
            alt="Tech Nights - Encuentros de innovación y networking"
            loading="lazy"
          />
          <img
            className="h-full w-full rounded-xl object-cover sm:col-start-2 sm:row-start-2"
            src="/FCA-fundacion/tech-caribe.jpg"
            alt="TechCaribe Fest - Festival de tecnología del Caribe"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
