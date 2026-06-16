import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { MapPin, Wifi, Users, Coffee, Presentation } from "lucide-react";

const features = [
  {
    icon: Presentation,
    title: "Espacios para eventos",
    description: "Charlas, talleres y meetups del ecosistema.",
  },
  {
    icon: Users,
    title: "Zonas de comunidad",
    description: "Lugares para conectar, colaborar y crear.",
  },
  {
    icon: Wifi,
    title: "Conectividad",
    description: "Todo listo para construir y aprender.",
  },
  {
    icon: Coffee,
    title: "Ambiente acogedor",
    description: "Un espacio pensado para la comunidad tech del Caribe.",
  },
];

export default function Sede() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Nuestra sede en Barranquilla | Costa Digital"
        description="Conoce la sede de Costa Digital y Fundación Código Abierto en El Prado, Barranquilla: un espacio para la innovación, la formación y el encuentro de la comunidad tech del Caribe."
        canonical="/sede"
        keywords={[
          "sede Costa Digital",
          "espacio innovación Barranquilla",
          "coworking tech Caribe",
          "El Prado Barranquilla",
        ]}
      />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Dónde sucede
              </p>
              <h1 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
                Un espacio donde el Caribe se vuelve epicentro tech
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
                En el corazón de El Prado, Barranquilla, está la sede que alberga
                a Costa Digital y a Fundación Código Abierto: un lugar diseñado
                para la innovación, la formación y el encuentro de la comunidad
                tech.
              </p>
            </div>
          </div>
        </section>

        {/* MAP + ADDRESS + PHOTO */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {/* Left column: map + address */}
              <div className="space-y-6">
                <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-border shadow-lg">
                  <iframe
                    title="Mapa de la sede de Costa Digital en El Prado, Barranquilla"
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
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <MapPin className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">
                        Dirección
                      </h2>
                      <p className="mt-1 text-foreground">Cra. 50 #72-126</p>
                      <p className="text-muted-foreground">
                        El Prado, Barranquilla, Atlántico
                      </p>
                    </div>
                  </div>
                </address>
              </div>

              {/* Right column: text + photo */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <p className="text-muted-foreground">
                    Con una ubicación privilegiada en El Prado, la sede está en
                    una posición central en Barranquilla. Un espacio cómodo y
                    adaptado a las necesidades de la comunidad tech de la costa.
                  </p>
                  <p className="mt-4 text-muted-foreground">
                    Este es un lugar mágico donde las cosas suceden y desde donde
                    Barranquilla y el Caribe se están convirtiendo en el nuevo
                    epicentro tech de LATAM.
                  </p>
                </div>

                <figure className="group relative h-[300px] w-full overflow-hidden rounded-xl border border-border shadow-lg">
                  <img
                    src="/sede.jpeg"
                    alt="Sede de Costa Digital en Barranquilla"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-display text-3xl font-bold text-primary md:text-4xl">
              Qué encontrarás
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Un espacio pensado para que la comunidad tech del Caribe se
              encuentre, aprenda y construya.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
                  >
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
                ¿Quieres visitarnos o realizar un evento aquí?
              </h2>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild>
                  <a href="mailto:hola@costadigital.org">Escríbenos</a>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/conocenos">Conócenos</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
