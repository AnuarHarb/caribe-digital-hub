import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/landing/Hero";
import { PillarsOverview } from "@/components/landing/PillarsOverview";
import { Impact } from "@/components/landing/Impact";
import { TechCentre } from "@/components/landing/TechCentre";
import { CommunitySection } from "@/components/landing/CommunitySection";

import { Innovation } from "@/components/landing/Innovation";
import { StartupsSection } from "@/components/landing/StartupsSection";
import { Audiences } from "@/components/landing/Audiences";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { CostaDigitalNews } from "@/components/landing/CostaDigitalNews";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { Footer } from "@/components/landing/Footer";
import { PulsoBanner } from "@/components/noticias/PulsoBanner";
import { useNoticias } from "@/hooks/useNoticias";
import { pickUltimoPulso } from "@/content/noticias";

export default function Landing() {
  const { data: notes = [] } = useNoticias();
  const ultimoPulso = pickUltimoPulso(notes);
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Costa Digital",
    alternateName: "Caribe Tech",
    url: "https://costadigital.org",
    description:
      "Ecosistema tech del Caribe colombiano. +120 proyectos en hackatones, +400 estudiantes, +5,000 asistentes a eventos. Eventos gratuitos como Tech Nights y Jueves de Cowork.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://costadigital.org/talento?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Costa Digital — Ecosistema Tech del Caribe | 3 años generando impacto"
        description="Costa Digital es el ecosistema tech del Caribe colombiano. +120 proyectos en hackatones, +400 estudiantes, +5,000 asistentes a eventos. Eventos gratuitos como Tech Nights y Jueves de Cowork. Barranquilla, Cartagena, Santa Marta."
        canonical="/"
        keywords={["ecosistema tech Caribe", "Caribe Tech", "tech del Caribe", "startups Caribe", "comunidad tech Barranquilla", "hackatón Barranquilla", "Tech Nights", "coworking Barranquilla", "eventos tech gratis", "IA Caribe", "innovación Caribe"]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <PillarsOverview />
        <Impact />
        <TechCentre />
        <CommunitySection />
        <Innovation />
        <StartupsSection />
        <Audiences />
        <PartnersSection />
        <CostaDigitalNews />
        <section className="container mx-auto px-4 py-12">
          <PulsoBanner note={ultimoPulso} />
        </section>
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
