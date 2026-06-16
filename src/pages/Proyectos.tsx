import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Project {
  title: string;
  category: string;
  image: string;
  description: string;
  link: string;
}

const projects: Project[] = [
  {
    title: "Barranqui-IA",
    category: "Hackathón",
    image: "/FCA-fundacion/cover-project-barranquiia.jpg",
    description:
      "Primer Hackatón de inteligencia artificial en el Caribe. Un evento de 48 horas sobre IA que reúne a builders del ecosistema Costa Digital.",
    link: "https://www.uninorte.edu.co/es/web/grupo-prensa/w/primera-hackaton-de-ia-en-el-caribe-traza-la-ruta-de-barranquilla-como-epicentro-tecnologico",
  },
  {
    title: "Tech Caribe Expo",
    category: "Conferencias",
    image: "/FCA-fundacion/cover-project-tech-caribe.jpg",
    description:
      "TechCaribe Expo reunió a expertos en tecnología, IA y emprendimiento, ofreciendo un espacio de innovación, conexiones y aprendizaje.",
    link: "https://www.eltiempo.com/colombia/barranquilla/barranquilla-sera-sede-de-tech-caribe-expo-2024-feria-que-impulsa-la-tecnologia-y-la-innovacion-3365508",
  },
  {
    title: "Becas con el gobierno",
    category: "Educación",
    image: "/FCA-fundacion/cover-project-gobernacion.jpg",
    description:
      "Junto a la Gobernación del Atlántico, Fundación Código Abierto ofrece becas para diplomados en tecnología, impulsando el talento digital de la región.",
    link: "https://www.instagram.com/atlanticotic/p/C_yUGeqvM5i/",
  },
  {
    title: "Tech Nights",
    category: "Comunidad",
    image: "/events/1.webp",
    description:
      "Encuentros mensuales sobre IA, innovación y networking que conectan al talento tech del Caribe.",
    link: "https://www.codigoabierto.tech/eventos",
  },
];

interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  { value: "100+", label: "egresados trabajando en tech" },
  { value: "3000+", label: "miembros en la comunidad" },
  { value: "350+", label: "builders en hackathons" },
  { value: "53+", label: "proyectos creados" },
];

export default function Proyectos() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Proyectos e impacto | Costa Digital"
        description="Eventos, programas e iniciativas que demuestran que desde el Caribe colombiano se crea tecnología de impacto. Conoce los casos de éxito de Costa Digital."
        canonical="/proyectos"
        keywords={[
          "Barranqui-IA",
          "Tech Caribe Expo",
          "proyectos tech Caribe",
          "impacto tecnología Barranquilla",
        ]}
      />
      <Navbar />
      <main>
        {/* HERO */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Impacto real
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold text-primary md:text-5xl">
              Proyectos que están transformando el Caribe
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Eventos, programas e iniciativas que demuestran que desde el
              Caribe colombiano se crea tecnología de impacto. Esto es lo que
              sucede cuando el talento, la comunidad y la innovación se
              encuentran.
            </p>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl text-center">
              Casos de éxito
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Iniciativas reales con resultados que se sienten en el ecosistema
              tecnológico de la región.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.title}
                  className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm"
                >
                  <div className="h-56 overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-6">
                    <span className="w-fit rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                      {project.category}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">
                      {project.title}
                    </h3>
                    <p className="flex-1 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center font-medium text-primary hover:text-primary/80"
                      aria-label={`Ver detalles de ${project.title}`}
                    >
                      Ver detalles
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="border-y border-border bg-muted/30 py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-display text-3xl font-bold text-accent md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">
              ¿Quieres que tu proyecto sea el próximo?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Sumemos esfuerzos para seguir construyendo el futuro tecnológico
              del Caribe colombiano.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/auth">Únete a la comunidad</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:hola@costadigital.org">Sé aliado</a>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
