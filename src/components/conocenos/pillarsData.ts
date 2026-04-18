export interface Pillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  institution: string;
  logo: string;
  logoAlt: string;
  color: "blue" | "green" | "purple" | "orange";
  description: string;
  fullDescription: string;
  features?: string[];
  website?: string;
}

export const pillars: Pillar[] = [
  {
    id: "educacion",
    number: "01",
    title: "Educación",
    subtitle: "que te conecta con el futuro",
    institution: "Tech Centre",
    logo: "/logos/techcentre-horizontal.webp",
    logoAlt: "Tech Centre",
    color: "blue",
    description:
      "La educación especializada es la base fundamental de todo ecosistema tecnológico sólido. A través de programas prácticos formamos a los profesionales que impulsarán la transformación digital del Caribe.",
    fullDescription:
      "La educación especializada es la base fundamental de todo ecosistema tecnológico sólido. Sin talento capacitado, ningún ecosistema puede crecer ni sostenerse. A través de programas prácticos y actualizados, formamos a los profesionales que impulsarán la transformación digital del Caribe, garantizando que la región cuente con el capital humano necesario para competir en el mercado global.",
    features: [
      "Presencialidad y mentores expertos",
      "Preparación para el mundo laboral",
      "Metodología práctica y contextual",
    ],
    website: "https://techcentre.co",
  },
  {
    id: "comunidad",
    number: "02",
    title: "Comunidad",
    subtitle: "que impulsa el cambio",
    institution: "Costa Digital",
    logo: "/logos/costa-digital.png",
    logoAlt: "Costa Digital",
    color: "green",
    description:
      "Un ecosistema tech fuerte requiere de conexiones y colaboración entre todos sus actores. La comunidad es el tejido que une a desarrolladores, empresas, universidades y gobierno.",
    fullDescription:
      "Un ecosistema tech fuerte requiere de conexiones y colaboración entre todos sus actores. La comunidad es el tejido que une a desarrolladores, empresas, universidades y gobierno, creando sinergias que multiplican el impacto. Costa Digital articula estos esfuerzos para construir un movimiento colectivo hacia la transformación tecnológica del Caribe.",
    features: [
      "Conecta con mentores y aliados",
      "Participa en eventos y talleres",
      "Únete a iniciativas de innovación",
    ],
    website: "https://costadigital.org",
  },
  {
    id: "innovacion",
    number: "03",
    title: "Innovación",
    subtitle: "que transforma realidades",
    institution: "Ciudad Inmersiva",
    logo: "/logos/ciudad-inmersiva.png",
    logoAlt: "Ciudad Inmersiva",
    color: "purple",
    description:
      "La innovación es el motor que convierte el conocimiento en valor real. Transformamos ideas en soluciones que resuelven problemas reales de empresas y emprendedores.",
    fullDescription:
      "La innovación es el motor que convierte el conocimiento en valor real. Un ecosistema tech sin capacidad de innovación se queda en teoría. A través de nuestro laboratorio, transformamos ideas en soluciones concretas que resuelven problemas reales de empresas y emprendedores, demostrando que el Caribe no solo puede adoptar tecnología, sino crearla y exportarla.",
    website: "https://ciudadinmersiva.com",
  },
  {
    id: "capital",
    number: "04",
    title: "Capital",
    subtitle: "que acelera el crecimiento",
    institution: "Caribe Ventures",
    logo: "/logos/caribe-ventures-black.png",
    logoAlt: "Caribe Ventures",
    color: "orange",
    description:
      "El capital es el combustible que permite que las ideas escalen y generen impacto. Sin acceso a financiamiento, incluso las mejores startups no pueden alcanzar su potencial.",
    fullDescription:
      "El capital es el combustible que permite que las ideas escalen y generen impacto. Sin acceso a financiamiento, incluso las mejores startups y proyectos tecnológicos no pueden alcanzar su potencial. Caribe Ventures cierra este círculo esencial del ecosistema, conectando el talento y la innovación con los recursos necesarios para crecer, escalar y competir a nivel nacional e internacional.",
    website: "https://caribe.ventures",
  },
];

export const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-600",
    ring: "ring-blue-500",
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    border: "border-green-500",
    text: "text-green-600",
    ring: "ring-green-500",
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    border: "border-purple-500",
    text: "text-purple-600",
    ring: "ring-purple-500",
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-600",
    ring: "ring-orange-500",
  },
} as const;
