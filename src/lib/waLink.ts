import { WHATSAPP } from "@/content/portafolio";

const BASE = `https://wa.me/${WHATSAPP}`;

const MESSAGES: Record<string, { es: string; en: string }> = {
  general: {
    es: "Hola, escribo desde costadigital.org. Me gustaría saber más.",
    en: "Hi, I'm writing from costadigital.org. I'd like to learn more.",
  },
  formacion: {
    es: "Hola, me interesa la formación de Tech Centre en Costa Digital.",
    en: "Hi, I'm interested in Tech Centre training at Costa Digital.",
  },
  software: {
    es: "Hola, me interesa software a la medida / agentes de IA en Costa Digital.",
    en: "Hi, I'm interested in custom software / AI agents at Costa Digital.",
  },
  asesorias: {
    es: "Hola, quiero agendar una asesoría en Costa Digital.",
    en: "Hi, I'd like to book a consulting session at Costa Digital.",
  },
  labMaker: {
    es: "Hola, me interesa el Lab Maker de Costa Digital.",
    en: "Hi, I'm interested in the Lab Maker at Costa Digital.",
  },
  biblioteca: {
    es: "Hola, quiero saber de la biblioteca de Costa Digital.",
    en: "Hi, I'd like to know about the Costa Digital library.",
  },
  cowork: {
    es: "Hola, quiero saber del espacio de cowork de Costa Digital.",
    en: "Hi, I'd like to know about the cowork space at Costa Digital.",
  },
  espacios: {
    es: "Hola, quiero cotizar un espacio o evento en Costa Digital.",
    en: "Hi, I'd like to quote a space or event at Costa Digital.",
  },
  laMarea: {
    es: "Hola, me interesa contenido o patrocinio en La Marea.",
    en: "Hi, I'm interested in content or sponsorship with La Marea.",
  },
  mareaReportero: {
    es: "Hola, quiero contar lo que está pasando o participar como reportero de La Marea.",
    en: "Hi, I want to tell what's happening or join La Marea as a reporter.",
  },
  cafe404: {
    es: "Hola, escribo por 404 Café en Costa Digital.",
    en: "Hi, I'm reaching out about 404 Café at Costa Digital.",
  },
  swag: {
    es: "Hola, quiero saber del SWAG de aliados de Costa Digital.",
    en: "Hi, I'd like to know about ally swag at Costa Digital.",
  },
  patrocinios: {
    es: "Hola, me interesan patrocinios o alianzas con Costa Digital.",
    en: "Hi, I'm interested in sponsorships or partnerships with Costa Digital.",
  },
  membresia: {
    es: "Hola, tengo preguntas sobre la membresía de Costa Digital.",
    en: "Hi, I have questions about Costa Digital membership.",
  },
};

export function waLink(
  serviceKey: string = "general",
  locale: "es" | "en" = "es"
): string {
  const msg = MESSAGES[serviceKey]?.[locale] ?? MESSAGES.general[locale];
  return `${BASE}?text=${encodeURIComponent(msg)}`;
}
