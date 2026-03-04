import { Navbar } from "@/components/Navbar";
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
  return (
    <div className="min-h-screen bg-background">
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
