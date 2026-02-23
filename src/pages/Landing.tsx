import { Navbar } from "@/components/Navbar";
import { HeroTalent } from "@/components/landing/HeroTalent";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { EventsCTA } from "@/components/landing/EventsCTA";
import { EcosystemMapCTA } from "@/components/landing/EcosystemMapCTA";
import { FeaturedJobs } from "@/components/landing/FeaturedJobs";
import { CostaDigitalNews } from "@/components/landing/CostaDigitalNews";
import { Stats } from "@/components/landing/Stats";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { Footer } from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroTalent />
        <HowItWorks />
        <EventsCTA />
        <EcosystemMapCTA />
        <FeaturedJobs />
        <CostaDigitalNews />
        <Stats />
        <LandingCTA />
      </main>
      <Footer />
    </div>
  );
}
