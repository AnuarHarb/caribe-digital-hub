import { ArrowRightIcon } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
  link: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Barranqui-IA",
    description:
      "Primer Hackatón de inteligencia artificial en el Caribe. Un evento de 48 horas sobre IA que reúne a builders del ecosistema Costa Digital.",
    image: "/events/hackaton-bquilla-2026-proyectos.jpg",
    category: "Hackathón",
    link: "https://www.uninorte.edu.co/es/web/grupo-prensa/w/primera-hackaton-de-ia-en-el-caribe-traza-la-ruta-de-barranquilla-como-epicentro-tecnologico",
  },
  {
    id: 2,
    title: "Tech Caribe Expo",
    description:
      "TechCaribe Expo reunió a expertos en tecnología, IA y emprendimiento, ofreciendo un espacio de innovación, conexiones y aprendizaje.",
    image: "/FCA-fundacion/cover-project-tech-caribe.jpg",
    category: "Conferencias",
    link: "https://www.eltiempo.com/colombia/barranquilla/barranquilla-sera-sede-de-tech-caribe-expo-2024-feria-que-impulsa-la-tecnologia-y-la-innovacion-3365508",
  },
  {
    id: 3,
    title: "Becas con el gobierno",
    description:
      "Junto a la Gobernación del Atlántico, Fundación Código Abierto ofrece becas para diplomados en tecnología, impulsando el talento digital de la región.",
    image: "/FCA-fundacion/cover-project-gobernacion.jpg",
    category: "Educación",
    link: "https://www.instagram.com/atlanticotic/p/C_yUGeqvM5i/",
  },
];

export function ConocenosImpactProjects() {
  return (
    <section id="impacto">
      <div className="mx-auto flex max-w-6xl flex-col gap-7 px-5 py-16">
        <header className="text-center">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">
            Proyectos Impactantes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Descubre nuestra colección de proyectos que están transformando
            comunidades y acelerando el ecosistema tech del Caribe.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.id}
              className="flex h-auto flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-transform duration-300"
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="flex h-auto flex-col justify-between gap-3 p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center font-medium text-primary transition-colors hover:text-primary/80"
                >
                  Ver detalles
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
