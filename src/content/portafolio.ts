export const DESCRIPTOR = "Costa Digital · Centro de Innovación del Caribe";
export const WHATSAPP = "573187529000";
export const CONTACT_EMAIL = "contacto@codigoabierto.tech";
export const CREYENTES_MAX = 60;

export type ProductKey =
  | "miembro_mensual"
  | "miembro_anual"
  | "residente_mensual"
  | "residente_anual"
  | "cowork_dia"
  | "tech_cupo"
  | "taller_maker"
  | "bono_cafe_10"
  | "bono_cafe_20";

export interface Product {
  amountCop: number;
  membershipPlan?: "miembro" | "residente";
  months?: number;
}

export const PRODUCTS: Record<ProductKey, Product> = {
  miembro_mensual: { amountCop: 70000, membershipPlan: "miembro", months: 1 },
  miembro_anual: { amountCop: 700000, membershipPlan: "miembro", months: 12 },
  residente_mensual: { amountCop: 250000, membershipPlan: "residente", months: 1 },
  residente_anual: { amountCop: 2500000, membershipPlan: "residente", months: 12 },
  cowork_dia: { amountCop: 25000 },
  tech_cupo: { amountCop: 100000 },
  taller_maker: { amountCop: 80000 },
  bono_cafe_10: { amountCop: 180000 },
  bono_cafe_20: { amountCop: 320000 },
};

export interface CatalogItem {
  key: string;
  productKey?: ProductKey;
  priceCop?: number;
  priceFrom?: boolean;
  payable: boolean;
}

export interface Service {
  key: string;
  space: string;
  anchor: string;
  featured?: boolean;
  social?: boolean;
  image: string;
  logo?: string;
  logoDark?: string;
  logoAlt?: string;
  items: CatalogItem[];
}

export const SERVICES: Service[] = [
  {
    key: "membresia",
    space: "todaLaCasa",
    anchor: "membresia",
    featured: true,
    image: "/sede/membresia.jpg",
    logo: "/logos/Costa_Digital_Logo_horizontal.png",
    logoDark: "/logos/Costa_Digital_Logo_horizontal_claro.png",
    logoAlt: "Costa Digital",
    items: [
      { key: "miembro", priceCop: 70000, productKey: "miembro_mensual", payable: true },
      { key: "residente", priceCop: 250000, productKey: "residente_mensual", payable: true },
      { key: "planAnual", payable: false },
    ],
  },
  {
    key: "formacion",
    space: "salones",
    anchor: "formacion",
    image: "/sede/patrocinios.jpg",
    logo: "/logos/tech-centre-dark.png",
    logoDark: "/logos/tech-centre-white.png",
    logoAlt: "Tech Centre",
    items: [
      { key: "modulo8", priceCop: 1400000, payable: false },
      { key: "moduloAvanzado", priceCop: 1600000, payable: false },
      { key: "rutaCompleta", priceFrom: true, priceCop: 4400000, payable: false },
      { key: "tallerCorporativoIa", priceCop: 1800000, payable: false },
      { key: "bootcampCorporativo", priceCop: 4500000, payable: false },
      { key: "reservaCupo", priceCop: 100000, productKey: "tech_cupo", payable: true },
    ],
  },
  {
    key: "software",
    space: "laboratorio",
    anchor: "software",
    image: "/sede/software.jpg",
    logo: "/logos/ciudad-inmersiva.png",
    logoAlt: "Ciudad Inmersiva",
    items: [
      { key: "diagnostico", payable: false },
      { key: "plataforma", priceFrom: true, priceCop: 20000000, payable: false },
      { key: "agenteIa", priceFrom: true, priceCop: 15000000, payable: false },
      { key: "soporte", priceFrom: true, priceCop: 1500000, payable: false },
    ],
  },
  {
    key: "asesorias",
    space: "salaJuntas",
    anchor: "asesorias",
    image: "/sede/asesorias.jpg",
    logo: "/logos/ciudad-inmersiva.png",
    logoAlt: "Ciudad Inmersiva",
    items: [
      { key: "sesionEstrategica", priceCop: 400000, payable: false },
      { key: "mentoria1h", priceCop: 90000, payable: false },
      { key: "bonoMentoria", priceCop: 300000, payable: false },
    ],
  },
  {
    key: "labMaker",
    space: "cuartoAuxiliar",
    anchor: "lab-maker",
    image: "/sede/lab-maker.jpg",
    items: [
      { key: "impresion3d", priceFrom: true, priceCop: 20000, payable: false },
      { key: "horaMaquina", priceCop: 15000, payable: false },
      { key: "tallerMaker", priceCop: 80000, productKey: "taller_maker", payable: true },
      { key: "tallerGrupo", priceFrom: true, priceCop: 800000, payable: false },
    ],
  },
  {
    key: "biblioteca",
    space: "biblioteca",
    anchor: "biblioteca",
    image: "/sede/biblioteca.jpg",
    logo: "/logos/404-cafe.png",
    logoDark: "/logos/404-cafe-claro.png",
    logoAlt: "404 Café",
    items: [
      { key: "consulta", payable: false },
      { key: "prestamo", payable: false },
    ],
  },
  {
    key: "cowork",
    space: "cowork",
    anchor: "cowork",
    image: "/sede/cowork.jpg",
    items: [
      { key: "jueves", payable: false },
      { key: "coworkDia", priceCop: 25000, productKey: "cowork_dia", payable: true },
      { key: "silla", payable: false },
    ],
  },
  {
    key: "espacios",
    space: "patioSalones",
    anchor: "espacios",
    image: "/sede/espacios.jpg",
    logo: "/logos/tech-nights.png",
    logoAlt: "Tech Nights",
    items: [
      { key: "patioSemana", priceCop: 900000, payable: false },
      { key: "patioViernes", priceCop: 1500000, payable: false },
      { key: "salonMediaJornada", priceCop: 180000, payable: false },
      { key: "salonJornadaCompleta", priceCop: 300000, payable: false },
      { key: "salaJuntasHora", priceCop: 45000, payable: false },
    ],
  },
  {
    key: "laMarea",
    space: "medio",
    anchor: "la-marea",
    image: "/sede/la-marea.jpg",
    logo: "/logos/la-marea.png",
    logoAlt: "La Marea",
    items: [
      { key: "coberturaEvento", priceCop: 600000, payable: false },
      { key: "reportaje", priceCop: 1200000, payable: false },
      { key: "patrocinioBoletin", priceCop: 400000, payable: false },
      { key: "perfilesComunidad", payable: false },
    ],
  },
  {
    key: "cafe404",
    space: "areaB",
    anchor: "cafe-404",
    social: true,
    image: "/sede/cafe-404.jpg",
    logo: "/logos/404-cafe.png",
    logoDark: "/logos/404-cafe-claro.png",
    logoAlt: "404 Café",
    items: [
      { key: "menuDia", priceCop: 20000, payable: false },
      { key: "bono10", priceCop: 180000, productKey: "bono_cafe_10", payable: true },
      { key: "bono20", priceCop: 320000, productKey: "bono_cafe_20", payable: true },
    ],
  },
  {
    key: "swag",
    space: "todaLaCasa",
    anchor: "swag",
    image: "/sede/swag.jpg",
    items: [
      { key: "mesa", payable: false },
      { key: "kit", payable: false },
    ],
  },
  {
    key: "patrocinios",
    space: "todaLaCasa",
    anchor: "patrocinios",
    image: "/sede/formacion.jpg",
    logo: "/logos/fca-black.png",
    logoDark: "/logos/logo-fca.webp",
    logoAlt: "Fundación Código Abierto",
    items: [
      { key: "aliadoFormacion", priceCop: 8800000, payable: false },
      { key: "namingAuditorio", payable: false },
    ],
  },
];

export const STATS = [
  { value: "3 años", labelKey: "stat1" },
  { value: "+400", labelKey: "stat2" },
  { value: "+5.000", labelKey: "stat3" },
] as const;

export const PILLAR_IDS = ["educacion", "comunidad", "empleo", "emprendimiento"] as const;

export function getProduct(key: ProductKey): Product {
  return PRODUCTS[key];
}

export function isValidProductKey(key: string): key is ProductKey {
  return key in PRODUCTS;
}

export function getServiceByAnchor(anchor: string): Service | undefined {
  return SERVICES.find((s) => s.anchor === anchor);
}
