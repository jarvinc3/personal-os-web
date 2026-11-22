import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const GENERAL_TERMS: readonly HelpTerm[] = [
  {
    slug: "app",
    term: "App",
    category: "general",
    definition:
      "Cada área de Personal OS que activas y usas: Finanzas, Agenda, Salud y Proyectos. Se encienden y apagan por separado en Ajustes → Apps; una app apagada no aparece en el menú.",
    aliases: ["aplicación", "módulo"],
  },
]
