import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Users, Heart, Lightbulb } from "lucide-react";

const leaders = [
  {
    initials: "AH",
    name: "Anuar Harb",
    role: "Fundador · Director",
    bio: "Desarrollador de software, líder del Google Developer Group Barranquilla y fundador de Fundación Código Abierto. Con más de 10 años de experiencia impulsando comunidades y proyectos de innovación, lidera la visión de convertir al Caribe en el nuevo epicentro tech de LATAM.",
  },
  {
    initials: "GT",
    name: "Grace Torres",
    role: "Co-líder · Gestión cultural",
    bio: "Cantante, artista y gestora cultural, comprometida con unir el arte, la creatividad y la tecnología para inspirar a nuevas generaciones. Junto a Anuar lidera el movimiento Costa Digital.",
  },
];

const values = [
  {
    icon: Lightbulb,
    title: "Innovación con propósito",
    description: "Creemos que la tecnología es la industria de las oportunidades.",
  },
  {
    icon: Users,
    title: "Comunidad primero",
    description: "El ecosistema se construye con y para las personas.",
  },
  {
    icon: Heart,
    title: "Impacto que cambia vidas",
    description: "Cada beca, evento y programa transforma realidades en la región.",
  },
];

export default function Equipo() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Equipo y liderazgo | Costa Digital"
        description="Conoce a las personas y al liderazgo detrás de Costa Digital, el centro de innovación del Caribe colombiano: Anuar Harb, Grace Torres y la Fundación Código Abierto."
        canonical="/equipo"
        keywords={[
          "equipo Costa Digital",
          "Anuar Harb",
          "Grace Torres",
          "Fundación Código Abierto",
          "líderes tech Caribe",
        ]}
      />
      <Navbar />

      <main>
        {/* HERO */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Quiénes lo hacen posible
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold text-primary md:text-4xl">
              El equipo detrás del movimiento
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Costa Digital nace de la convicción de que el Caribe colombiano puede ser el
              nuevo epicentro tech de LATAM. Detrás hay personas que lo construyen todos los
              días.
            </p>
          </div>
        </section>

        {/* LEADERSHIP */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl text-center">
              Liderazgo
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Anuar Harb y Grace Torres, una pareja de soñadores que decidió transformar la
              historia tecnológica del Caribe colombiano.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {leaders.map((leader) => (
                <article
                  key={leader.name}
                  className="rounded-xl border border-border bg-card p-8 shadow-sm text-center"
                >
                  <div
                    className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-accent/20 text-accent"
                    aria-hidden="true"
                  >
                    <span className="font-display text-2xl font-bold">
                      {leader.initials}
                    </span>
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-foreground">
                    {leader.name}
                  </h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{leader.role}</p>
                  <p className="mt-4 text-muted-foreground">{leader.bio}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="bg-muted/30 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl text-center">
              Lo que nos mueve
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Los principios que guían cada decisión y cada proyecto del equipo.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {values.map((value) => {
                const Icon = value.icon;
                return (
                  <article
                    key={value.title}
                    className="rounded-xl border border-border bg-card p-6 text-center shadow-sm"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold text-foreground">
                      {value.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">{value.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* JOIN CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              Súmate al equipo y a la causa
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Buscamos voluntarios, mentores y aliados que quieran construir el futuro tech del
              Caribe.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <a href="mailto:hola@codigoabierto.tech">Quiero participar</a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/comunidades">Ver comunidades</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
