import { LandingTheme } from "./landing-theme"
import { Footer, Navbar } from "@/src/modules/landing"
import type { ReactNode } from "react"

export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <LandingTheme>
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        {children}
        <Footer />
      </div>
    </LandingTheme>
  )
}
