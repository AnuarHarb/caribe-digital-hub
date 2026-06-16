import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/landing/Hero";
import { PillarsOverview } from "@/components/landing/PillarsOverview";
import { Impact } from "@/components/landing/Impact";
import { TechCentre } from "@/components/landing/TechCentre";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { TalentNetworkCTA } from "@/components/landing/TalentNetworkCTA";
import { Innovation } from "@/components/landing/Innovation";
import { StartupsSection } from "@/components/landing/StartupsSection";
import { Audiences } from "@/components/landing/Audiences";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { CostaDigitalNews } from "@/components/landing/CostaDigitalNews";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Costa Digital",
    alternateName: "Caribe Tech",
    url: "https://costadigital.org",
    description:
      "Centro de innovación y transformación tecnológica del Caribe que articula educación, comunidad, innovación y capital para convertir al Caribe colombiano en el nuevo epicentro tech de LATAM.",
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
        title="Costa Digital — Centro de Innovación Tech del Caribe | Camino al epicentro tech de LATAM"
        description="Costa Digital es el centro de innovación y transformación tecnológica del Caribe colombiano. Articula educación, comunidad, innovación y capital para convertir la región en el nuevo epicentro tech de LATAM. Barranquilla, Cartagena, Santa Marta."
        canonical="/"
        keywords={["centro de innovación Caribe", "epicentro tech LATAM", "Caribe Tech", "tech del Caribe", "ecosistema tech Caribe", "startups Caribe", "comunidad tech Barranquilla", "hackathons Caribe", "innovación Caribe"]}
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
        <TalentNetworkCTA />
        <Innovation />
        <StartupsSection />
        <Audiences />
        <PartnersSection />
        <CostaDigitalNews />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
