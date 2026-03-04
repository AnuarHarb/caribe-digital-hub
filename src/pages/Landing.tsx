import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/landing/Hero";
import { EcosystemOverview } from "@/components/landing/EcosystemOverview";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { TechCentre } from "@/components/landing/TechCentre";
import { StartupsSection } from "@/components/landing/StartupsSection";
import { TalentNetworkCTA } from "@/components/landing/TalentNetworkCTA";
import { CostaDigitalNews } from "@/components/landing/CostaDigitalNews";
import { PartnersSection } from "@/components/landing/PartnersSection";
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
      "Ecosistema tech del Caribe que conecta comunidades, talento, startups y capital.",
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
        title="Costa Digital — Ecosistema Tech del Caribe | Startups, talento y comunidad"
        description="Costa Digital es el ecosistema tech del Caribe que conecta comunidades, talento, startups y capital en la región Caribe de Colombia. Barranquilla, Cartagena, Santa Marta."
        canonical="/"
        keywords={["Caribe Tech", "tech del Caribe", "ecosistema tech Caribe", "startups Caribe", "comunidad tech Barranquilla", "hackathons Caribe", "innovación Caribe"]}
      />
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(websiteJsonLd)}
        </script>
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <EcosystemOverview />
        <CommunitySection />
        <TechCentre />
        <StartupsSection />
        <TalentNetworkCTA />
        <CostaDigitalNews />
        <PartnersSection />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
