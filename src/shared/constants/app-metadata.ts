const FALLBACK_APP_URL = "http://localhost:3000"

/** Identidad del cliente web, la que consume la metadata de `app/layout.tsx`. */
export const appMetadata = {
  name: "Personal OS",
  description:
    "Personal OS centraliza y automatiza la gestión de tus finanzas, agenda, proyectos, salud y suscripciones en una sola app potenciada por inteligencia artificial.",
  author: "Personal OS",
  url: (process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL).replace(
    /\/+$/,
    ""
  ),
  keywords: [
    "personal os",
    "personal os web",
    "gestión personal",
    "finanzas personales",
    "agente IA",
    "productividad",
    "automatización",
    "agenda",
    "suscripciones",
  ],
}
