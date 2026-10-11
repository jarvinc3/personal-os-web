import { AISection } from "@/src/modules/landing/components/AISection"
import { FeaturesSection } from "@/src/modules/landing/components/FeaturesSection"
import { HeroSection } from "@/src/modules/landing/components/HeroSection"
import { ModulesSection } from "@/src/modules/landing/components/ModulesSection"
import { WaitlistSection } from "@/src/modules/landing/components/WaitlistSection"
export function LandingScreen() {
  return (
    <main>
      <HeroSection />
      <FeaturesSection />
      <ModulesSection />
      <AISection />
      <WaitlistSection />
    </main>
  )
}
