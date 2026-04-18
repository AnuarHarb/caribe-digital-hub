import { MapPin } from "lucide-react";

export function ConocenosLocation() {
  return (
    <section id="ubicacion" className="bg-[#E1F3FE] dark:bg-blue-950/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-5 py-16">
        <div className="flex flex-col gap-8">
          <header className="text-center">
            <h2 className="mb-3 text-4xl font-bold text-foreground md:text-5xl">
              <span className="mb-4 mr-2 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
                <MapPin className="h-8 w-8 text-blue-500" />
              </span>
              Nuestra <span className="text-blue-500">Sede</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Un espacio diseñado para la innovación y el crecimiento tecnológico
              en el corazón del Caribe colombiano.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-border shadow-lg">
                <iframe
                  title="Ubicación de la sede en Barranquilla"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3916.538907882707!2d-74.8045491!3d10.9981343!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8ef42d0ad033385b%3A0x326de6a0f5244065!2sCra.%2050%20%2372-126%2C%20Nte.%20Centro%20Historico%2C%20Barranquilla%2C%20Atl%C3%A1ntico!5e0!3m2!1ses-419!2sco!4v1736454294702!5m2!1ses-419!2sco"
                  width="100%"
                  height="100%"
                  className="border-none"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              <address className="rounded-xl border border-border bg-card p-6 not-italic shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <MapPin className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-xl font-semibold text-foreground">
                      Dirección
                    </h3>
                    <p className="text-base text-foreground/80">
                      Cra. 50 #72-126
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      El Prado, Barranquilla, Atlántico
                    </p>
                  </div>
                </div>
              </address>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex-1 rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="space-y-4 leading-relaxed text-foreground/80">
                  <p className="text-base">
                    Con una ubicación privilegiada en El Prado, la sede que
                    alberga al movimiento Costa Digital y a Fundación Código
                    Abierto está en una posición central en Barranquilla. Un
                    espacio cómodo y adaptado a las necesidades de la comunidad
                    tech de la costa.
                  </p>
                  <p className="text-base">
                    Este es un lugar mágico donde las cosas suceden y desde
                    donde Barranquilla y el Caribe se están convirtiendo en el
                    nuevo epicentro tech de Colombia.
                  </p>
                </div>
              </div>

              <figure className="group relative h-[300px] w-full overflow-hidden rounded-xl border border-border shadow-lg">
                <img
                  src="/sede.jpeg"
                  alt="Sede de Costa Digital y Fundación Código Abierto en Barranquilla"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
              </figure>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
