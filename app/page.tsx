import { Navbar } from "@/src/modules/landing/components/Navbar";
import { HeroSection } from "@/src/modules/landing/components/HeroSection";
import { FeaturesSection } from "@/src/modules/landing/components/FeaturesSection";
import { ModulesSection } from "@/src/modules/landing/components/ModulesSection";
import { AISection } from "@/src/modules/landing/components/AISection";
import { WaitlistSection } from "@/src/modules/landing/components/WaitlistSection";
import { Footer } from "@/src/modules/landing/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal OS — Tu sistema operativo personal con IA",
  description:
    "Centraliza y automatiza la gestión de tus finanzas, agenda, proyectos, salud y suscripciones en una sola app potenciada por inteligencia artificial.",
};

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ModulesSection />
        <AISection />
        <WaitlistSection />
      </main>
      <Footer />
    </div>
  );
}
