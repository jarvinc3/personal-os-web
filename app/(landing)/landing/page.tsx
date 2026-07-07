import { AISection } from "@/src/modules/landing/components/AISection";
import { FeaturesSection } from "@/src/modules/landing/components/FeaturesSection";
import { HeroSection } from "@/src/modules/landing/components/HeroSection";
import { ModulesSection } from "@/src/modules/landing/components/ModulesSection";
import { WaitlistSection } from "@/src/modules/landing/components/WaitlistSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal OS — Tu sistema operativo personal con IA",
  description:
    "Centraliza y automatiza la gestión de tus finanzas, agenda, proyectos, salud y suscripciones en una sola app potenciada por inteligencia artificial.",
};

export default function LandingPage() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <ModulesSection />
      <AISection />
      <WaitlistSection />
    </main>
  );
}
