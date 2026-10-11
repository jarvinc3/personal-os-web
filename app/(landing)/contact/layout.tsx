import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con el equipo de Personal OS. Responderemos en 1 a 3 días hábiles.",
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
