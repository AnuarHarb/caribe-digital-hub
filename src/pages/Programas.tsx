import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { DESCRIPTOR } from "@/content/portafolio";
import { CheckoutButton } from "@/components/portafolio/MembershipBlocks";
import { waLink } from "@/lib/waLink";
import { useTranslation } from "react-i18next";
import { GraduationCap, ArrowRight } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function Programas() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const formacion = t("portafolio.services.formacion", { returnObjects: true }) as {
    title: string;
    description: string;
    items: Record<string, { name: string; note?: string }>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Tech Centre · Formación | ${DESCRIPTOR}`}
        description={formacion.description}
        canonical="/programas"
      />
      <Navbar />
      <main>
        <section className="hero-bg py-20 md:py-28">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-aqua" weight="duotone" aria-hidden />
            <h1 className="mt-4 font-display text-4xl font-extrabold text-white md:text-5xl">
              {formacion.title}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[#DDE4F6]">{formacion.description}</p>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-2xl font-bold">Rutas Producto y Datos</h2>
            <ul className="mt-6 space-y-4">
              {Object.entries(formacion.items).map(([key, item]) => (
                <li key={key} className="rounded-xl border border-line p-4">
                  <strong className="text-navy dark:text-primary">{item.name}</strong>
                  {item.note && <p className="mt-1 text-sm text-muted-foreground">{item.note}</p>}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <CheckoutButton productKey="tech_cupo" label="Reservar cupo $100.000" />
              <a href={waLink("formacion", locale)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">Diagnóstico gratis por WhatsApp</Button>
              </a>
              <Link to="/servicios#formacion">
                <Button variant="ghost">
                  Ver precios completos
                  <ArrowRight weight="bold" aria-hidden />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
