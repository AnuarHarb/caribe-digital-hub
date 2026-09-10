export interface Pillar {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  institution: string;
  color: "blue" | "green" | "purple" | "orange";
  description: string;
  fullDescription: string;
  features?: string[];
  link?: string;
  linkLabel?: string;
}

export const pillars: Pillar[] = [
  {
    id: "educacion",
    number: "01",
    title: "Educación",
    subtitle: "de cero a la industria",
    institution: "Tech Centre",
    color: "blue",
    description:
      "Llegas de cero y sales con algo hecho. Rutas de Producto y Datos, ocho semanas, máximo 12 personas y un demo day. El diagnóstico gratis te dice por dónde empezar.",
    fullDescription:
      "Dos rutas presenciales — Producto y Datos — con módulos de 8 semanas, grupos de máximo 12 personas y un proyecto real en demo day. El diagnóstico gratuito te ubica donde debes empezar.",
    features: [
      "Rutas Producto y Datos",
      "Presencial, 8 h/semana",
      "Demo day con proyecto real",
    ],
    link: "/programas",
    linkLabel: "Ver formación",
  },
  {
    id: "comunidad",
    number: "02",
    title: "Comunidad y eventos",
    subtitle: "que se apoya y se refiere",
    institution: "Fundación Código Abierto",
    color: "green",
    description:
      "Tech Nights el tercer sábado, Barranqui-IA, TechCaribe Fest y Jueves de Cowork. Membresías y comunidades que se encuentran en la casa y se apoyan.",
    fullDescription:
      "Tech Nights, Barranqui-IA, TechCaribe Fest, Jueves de Cowork y comunidades ancla desde Supabase. La casa es el punto de encuentro del ecosistema tech del Caribe.",
    features: [
      "Membresías Miembro y Residente",
      "Eventos abiertos y cerrados",
      "Red de talento y comunidades",
    ],
    link: "/comunidades",
    linkLabel: "Explorar comunidad",
  },
  {
    id: "empleo",
    number: "03",
    title: "Innovación y empleo",
    subtitle: "talento con oportunidades reales",
    institution: "Ciudad Inmersiva",
    color: "purple",
    description:
      "Quien se forma aquí encuentra trabajo. La red de talento conecta egresados con empresas del Caribe. Perfiles, ofertas y convocatorias en un solo lugar.",
    fullDescription:
      "La red de talento de Costa Digital conecta profesionales formados en la casa con empresas del Caribe. Perfiles, empleos y convocatorias en un solo lugar.",
    features: [
      "Directorio de talento tech",
      "Ofertas laborales del ecosistema",
      "Perfiles de egresados Tech Centre",
    ],
    link: "/talento",
    linkLabel: "Ver red de talento",
  },
  {
    id: "emprendimiento",
    number: "04",
    title: "Emprendimiento, startups y capital",
    subtitle: "ideas que se vuelven empresa",
    institution: "Caribe Ventures",
    color: "orange",
    description:
      "De la idea al producto. Software, agentes de IA, Lab Maker y mentoría. Caribe Ventures acompaña a quien está armando empresa en la región.",
    fullDescription:
      "Software a la medida, agentes de IA, Lab Maker y mentoría técnica. Por fases, sin plantillas, con entregas contra hitos. El laboratorio convierte ideas del Caribe en productos.",
    features: [
      "Software y agentes de IA",
      "Lab Maker · impresión 3D",
      "Mentoría y sesiones estratégicas",
    ],
    link: "/servicios#software",
    linkLabel: "Ver servicios",
  },
];

export const colorClasses = {
  blue: {
    bg: "bg-brillante",
    light: "bg-paper",
    border: "border-brillante",
    text: "text-brillante",
    ring: "ring-brillante",
  },
  green: {
    bg: "bg-aqua",
    light: "bg-paper",
    border: "border-aqua",
    text: "text-aqua",
    ring: "ring-aqua",
  },
  purple: {
    bg: "bg-azul",
    light: "bg-paper",
    border: "border-azul",
    text: "text-azul",
    ring: "ring-azul",
  },
  orange: {
    bg: "bg-brillante",
    light: "bg-paper",
    border: "border-brillante/60",
    text: "text-brillante",
    ring: "ring-brillante",
  },
} as const;
