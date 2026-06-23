import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Footer } from "@/components/landing/Footer";
import { ConocenosHero } from "@/components/conocenos/Hero";
import { ConocenosMission } from "@/components/conocenos/Mission";
import { ConocenosTeam } from "@/components/conocenos/Team";
import { ConocenosImpactProjects } from "@/components/conocenos/ImpactProjects";
import { ConocenosLocation } from "@/components/conocenos/Location";
import { ConocenosFAQ } from "@/components/conocenos/FAQ";
import { AboutCTA } from "@/components/conocenos/AboutCTA";

export default function Conocenos() {
  const { hash } = useLocation();

  // Desplaza a la sección correspondiente (#equipo, #proyectos, #sede, #faq)
  // cuando se llega con un hash, incluido el de las redirecciones legacy.
  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() =>
        el.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  }, [hash]);

  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Sobre nosotros — Costa Digital",
    url: "https://costadigital.org/conocenos",
    description:
      "Conoce el movimiento Costa Digital y Fundación Código Abierto: misión, equipo, proyectos, sede e impacto en el ecosistema tech del Caribe colombiano.",
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
        title="Sobre nosotros — Costa Digital"
        description="Conoce el movimiento Costa Digital y Fundación Código Abierto: misión, equipo, proyectos e impacto, y nuestra sede en Barranquilla, corazón del ecosistema tech del Caribe."
        canonical="/conocenos"
        keywords={[
          "Costa Digital",
          "Fundación Código Abierto",
          "ecosistema tech Caribe",
          "equipo Costa Digital",
          "proyectos tech Caribe",
          "sede Barranquilla",
          "Anuar Harb",
          "Grace Torres",
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
        <ConocenosTeam />
        <ConocenosImpactProjects />
        <ConocenosLocation />
        <ConocenosFAQ />
        <AboutCTA />
      </main>
      <Footer />
    </div>
  );
}
