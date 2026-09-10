import { Navbar } from "@/components/Navbar";
import { SEOHead } from "@/components/SEOHead";
import { Hero } from "@/components/landing/Hero";
import { PillarsOverview } from "@/components/landing/PillarsOverview";
import { ServicesGrid } from "@/components/landing/ServicesGrid";
import { MembershipTeaser } from "@/components/landing/MembershipTeaser";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { CostaDigitalNews } from "@/components/landing/CostaDigitalNews";
import { Cafe404 } from "@/components/landing/Cafe404";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { SponsorshipTeaser } from "@/components/landing/SponsorshipTeaser";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { Footer } from "@/components/landing/Footer";
import { PulsoBanner } from "@/components/noticias/PulsoBanner";
import { DESCRIPTOR } from "@/content/portafolio";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${DESCRIPTOR} | Portafolio de servicios`}
        description="Formación tech, membresías, software, Lab Maker, 404 Café y comunidad en Barranquilla. Todo pasa en la sede."
        canonical="/"
        keywords={[
          "Centro de Innovación Caribe",
          "membresía Costa Digital",
          "Tech Centre Barranquilla",
          "404 Café",
          "Lab Maker",
          "coworking Barranquilla",
        ]}
      />
      <Navbar />
      <main>
        <Hero />
        <PillarsOverview />
        <ServicesGrid />
        <MembershipTeaser />
        <CommunitySection />
        <CostaDigitalNews />
        <section className="container mx-auto px-4 py-10">
          <PulsoBanner />
        </section>
        <Cafe404 />
        <PartnersSection />
        <SponsorshipTeaser />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
