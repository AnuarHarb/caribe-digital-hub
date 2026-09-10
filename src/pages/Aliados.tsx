import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { DESCRIPTOR } from "@/content/portafolio";
import { LegalAnnex } from "@/components/portafolio/MembershipBlocks";
import { waLink } from "@/lib/waLink";
import { useTranslation } from "react-i18next";
import { Handshake, GraduationCap, Buildings } from "@phosphor-icons/react";
import { Link } from "react-router-dom";

export default function Aliados() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("en") ? "en" : "es";
  const patrocinios = t("portafolio.services.patrocinios", { returnObjects: true }) as {
    title: string;
    description: string;
    items: Record<string, { name: string; note?: string }>;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Patrocinios y aliados | ${DESCRIPTOR}`}
        description={patrocinios.description}
        canonical="/aliados"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <header className="mx-auto max-w-2xl text-center">
          <Handshake className="mx-auto h-12 w-12 text-brillante" weight="duotone" aria-hidden />
          <h1 className="mt-4 font-display text-4xl font-extrabold text-navy dark:text-primary">
            {patrocinios.title}
          </h1>
          <p className="mt-4 text-muted-foreground">{patrocinios.description}</p>
        </header>

        <ul className="mx-auto mt-12 grid max-w-3xl gap-6">
          <li className="rounded-2xl border border-line p-6">
            <GraduationCap className="h-8 w-8 text-brillante" weight="duotone" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-bold">
              {patrocinios.items.aliadoFormacion.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{patrocinios.items.aliadoFormacion.note}</p>
            <p className="mt-2 font-mono text-brillante">$8.800.000</p>
          </li>
          <li className="rounded-2xl border border-line p-6">
            <Buildings className="h-8 w-8 text-brillante" weight="duotone" aria-hidden />
            <h2 className="mt-3 font-display text-xl font-bold">
              {patrocinios.items.namingAuditorio.name}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{patrocinios.items.namingAuditorio.note}</p>
          </li>
        </ul>

        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap gap-4">
          <a href={waLink("patrocinios", locale)} target="_blank" rel="noopener noreferrer">
            <Button size="lg">Hablar por WhatsApp</Button>
          </a>
          <Link to="/servicios#patrocinios">
            <Button size="lg" variant="outline">
              Ver portafolio completo
            </Button>
          </Link>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <LegalAnnex />
        </div>
      </main>
      <Footer />
    </div>
  );
}
