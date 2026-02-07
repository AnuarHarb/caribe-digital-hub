import { useState } from "react";
import { MembresiaNav } from "@/components/membresia/MembresiaNav";
import { Hero } from "@/components/membresia/Hero";
import { WhatIs } from "@/components/membresia/WhatIs";
import { ForWho } from "@/components/membresia/ForWho";
import { Benefits } from "@/components/membresia/Benefits";
import { Plans } from "@/components/membresia/Plans";
import { Impact } from "@/components/membresia/Impact";
import { FAQ } from "@/components/membresia/FAQ";
import { FinalCTA } from "@/components/membresia/FinalCTA";
import { FloatingCTA } from "@/components/membresia/FloatingCTA";
import { SignupModal } from "@/components/membresia/SignupModal";

type PlanType = "community" | "builder" | "company" | "enterprise";

export default function Membresia() {
  const [modalOpen, setModalOpen] = useState(false);
  const [preselectedPlan, setPreselectedPlan] = useState<PlanType | undefined>();

  const handleJoinClick = () => {
    setPreselectedPlan(undefined);
    setModalOpen(true);
  };

  const handlePlanSelect = (plan: PlanType) => {
    setPreselectedPlan(plan);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen scroll-smooth bg-background">
      <MembresiaNav onJoinClick={handleJoinClick} />
      <Hero onJoinClick={handleJoinClick} />
      <WhatIs />
      <ForWho />
      <Benefits />
      <Plans onPlanSelect={handlePlanSelect} />
      <Impact />
      <FAQ />
      <FinalCTA onJoinClick={handleJoinClick} />
      <FloatingCTA onJoinClick={handleJoinClick} />
      <SignupModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        preselectedPlan={preselectedPlan}
      />
    </div>
  );
}
