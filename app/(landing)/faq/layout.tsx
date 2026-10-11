import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Preguntas Frecuentes",
  description:
    "Encuentra respuestas a las preguntas más comunes sobre Personal OS, su funcionamiento, seguridad y disponibilidad.",
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
