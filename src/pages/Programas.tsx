import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Rocket,
  Users,
  MapPin,
  Briefcase,
  Wrench,
  Award,
  ArrowRight,
} from "lucide-react";

const TECH_CENTRE_URL = "https://techcentre.co";
const CONTACT_EMAIL = "mailto:hola@costadigital.org";

const programs = [
  {
    icon: GraduationCap,
    title: "Diplomados especializados",
    description:
      "Rutas de formación profundas en tecnología, diseñadas para llevarte de los fundamentos a un nivel profesional listo para el mercado.",
  },
  {
    icon: Rocket,
    title: "Cursos cortos y Bootcamps",
    description:
      "Programas intensivos y prácticos para adquirir habilidades concretas en pocas semanas y acelerar tu entrada al mundo tech.",
  },
  {
    icon: Users,
    title: "Mentoría y práctica con profesionales",
    description:
      "Aprende de la mano de mentores que trabajan activamente en la industria, con proyectos reales y acompañamiento personalizado.",
  },
];

const topics = [
  "Inteligencia Artificial",
  "Desarrollo Web",
  "Cloud",
  "Datos",
];

const methodology = [
  {
    icon: MapPin,
    title: "Presencialidad y mentores expertos",
    description:
      "Formación presencial guiada por profesionales activos en el sector tecnológico.",
  },
  {
    icon: Briefcase,
    title: "Preparación para el mundo laboral",
    description:
      "Habilidades y portafolio orientados a lo que la industria realmente necesita.",
  },
  {
    icon: Wrench,
    title: "Metodología práctica y contextual",
    description:
      "Aprende construyendo proyectos reales conectados con el contexto del Caribe.",
  },
];

export default function Programas() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Programas y becas | Costa Digital"
        description="Programas presenciales y prácticos en software, datos, diseño e inteligencia artificial junto a Tech Centre, más becas con el sector público para impulsar el talento tech del Caribe colombiano."
        canonical="/programas"
        keywords={[
          "formación tech Caribe",
          "becas tecnología Barranquilla",
          "Tech Centre",
          "diplomados IA Caribe",
        ]}
      />
      <Navbar />
      <main>
        {/* HERO */}
        <header
          className="bg-primary text-primary-foreground"
          aria-labelledby="programas-hero-title"
        >
          <div className="container mx-auto px-4 py-20 md:py-28">
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/80">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Pilar 01 · Educación
              </span>

              <img
                src="/logos/tech-centre-white.png"
                alt="Tech Centre"
                className="mt-8 h-10 w-auto md:h-12"
              />

              <h1
                id="programas-hero-title"
                className="font-display mt-6 text-3xl font-bold md:text-5xl"
              >
                Formación que te conecta con el futuro tech
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-base text-primary-foreground/80 md:text-lg">
                Programas presenciales y prácticos en software, datos, diseño e
                inteligencia artificial, guiados por profesionales activos en el
                mercado. La base del talento que está convirtiendo al Caribe en
                el nuevo epicentro tech de LATAM.
              </p>

              <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 sm:w-auto"
                >
                  <a
                    href={TECH_CENTRE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Inscríbete en Tech Centre
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground sm:w-auto"
                >
                  <a href={CONTACT_EMAIL}>Habla con nosotros</a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* PROGRAMS */}
        <section
          className="py-20 md:py-28"
          aria-labelledby="programas-programs-title"
        >
          <div className="container mx-auto px-4">
            <h2
              id="programas-programs-title"
              className="font-display text-center text-3xl font-bold text-primary md:text-4xl"
            >
              Programas para cada etapa de tu carrera
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Desde tus primeros pasos hasta la especialización, encuentra la
              ruta que se ajusta a tus metas y a la demanda del mercado.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {programs.map((program) => {
                const Icon = program.icon;
                return (
                  <article
                    key={program.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display mt-5 text-xl font-bold text-primary">
                      {program.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {program.description}
                    </p>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 flex flex-col items-center gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Áreas de formación
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {topics.map((topic) => (
                  <Badge key={topic} variant="secondary">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* METODOLOGÍA */}
        <section
          className="bg-muted/30 py-20 md:py-28"
          aria-labelledby="programas-metodologia-title"
        >
          <div className="container mx-auto px-4">
            <h2
              id="programas-metodologia-title"
              className="font-display text-center text-3xl font-bold text-primary md:text-4xl"
            >
              Una metodología pensada para el mundo real
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Aprender haciendo, junto a quienes ya construyen el futuro tech del
              Caribe.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {methodology.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-accent/30 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="font-display mt-5 text-lg font-bold text-primary">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* BECAS */}
        <section
          className="py-20 md:py-28"
          aria-labelledby="programas-becas-title"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-8 shadow-sm md:p-12">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <Award className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2
                  id="programas-becas-title"
                  className="font-display mt-5 text-3xl font-bold text-primary md:text-4xl"
                >
                  Becas con el sector público
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                  Junto a la Gobernación del Atlántico, Fundación Código Abierto
                  ofrece becas para diplomados en tecnología, impulsando el
                  talento digital de la región. Más de 100 personas formadas con
                  nosotros hoy trabajan en la industria tecnológica.
                </p>
                <Button asChild size="lg" className="mt-8">
                  <a href={CONTACT_EMAIL}>Conoce las convocatorias</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section
          className="bg-primary py-20 text-primary-foreground md:py-28"
          aria-labelledby="programas-cta-title"
        >
          <div className="container mx-auto px-4">
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <picture>
                <img
                  src="/logos/tech-centre-white.png"
                  alt="Tech Centre"
                  className="h-9 w-auto md:h-10"
                />
              </picture>
              <h2
                id="programas-cta-title"
                className="font-display mt-6 text-3xl font-bold md:text-4xl"
              >
                Tu carrera tech empieza en el Caribe
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
                Da el primer paso hacia una profesión con futuro. Fórmate con
                Tech Centre y únete al talento que está transformando la región.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <a
                  href={TECH_CENTRE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Inscríbete en Tech Centre
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
