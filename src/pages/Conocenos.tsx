import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { ConocenosHero } from "@/components/conocenos/Hero";
import { ConocenosMission } from "@/components/conocenos/Mission";
import { EcosystemPillars } from "@/components/conocenos/EcosystemPillars";
import { ConocenosLocation } from "@/components/conocenos/Location";
import { ConocenosImpactProjects } from "@/components/conocenos/ImpactProjects";
import { ConocenosFAQ } from "@/components/conocenos/FAQ";

export default function Conocenos() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Conócenos — Costa Digital",
    url: "https://costadigital.org/conocenos",
    description:
      "Conoce el movimiento Costa Digital y Fundación Código Abierto: misión, pilares, sede e impacto en el ecosistema tech del Caribe colombiano.",
    mainEntity: {
      "@type": "NonprofitOrganization",
      name: "Fundación Código Abierto",
      alternateName: "Costa Digital",
      url: "https://costadigital.org",
      logo: "https://costadigital.org/logos/costa-digital.png",
      description:
        "Movimiento que articula comunidades, talento, startups, educación y capital para convertir al Caribe colombiano en el nuevo epicentro tech de Colombia.",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Cra. 50 #72-126",
        addressLocality: "Barranquilla",
        addressRegion: "Atlántico",
        addressCountry: "CO",
      },
      areaServed: {
        "@type": "GeoRegion",
        name: "Región Caribe colombiana",
      },
    },
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <SEOHead
        title="Conócenos — Costa Digital"
        description="Conoce el movimiento Costa Digital y Fundación Código Abierto: misión, pilares (Tech Centre, Costa Digital, Ciudad Inmersiva, Caribe Ventures), sede en Barranquilla e impacto en el ecosistema tech del Caribe."
        canonical="/conocenos"
        keywords={[
          "Costa Digital",
          "Fundación Código Abierto",
          "ecosistema tech Caribe",
          "misión",
          "Barranquilla tech",
          "Tech Centre",
          "Ciudad Inmersiva",
          "Caribe Ventures",
          "epicentro tecnológico Caribe",
        ]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(aboutJsonLd)}</script>
      </Helmet>
      <Navbar />
      <main>
        <ConocenosHero />
        <ConocenosMission />
        <EcosystemPillars />
        <ConocenosLocation />
        <ConocenosImpactProjects />
        <ConocenosFAQ />
      </main>
      <Footer />
    </div>
  );
}
