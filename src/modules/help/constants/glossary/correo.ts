import type { HelpTerm } from "@/src/modules/help/types/help.types"

export const CORREO_TERMS: readonly HelpTerm[] = [
  {
    slug: "importar-estado-de-cuenta",
    term: "Importar estado de cuenta",
    category: "correo",
    definition:
      "Subir el PDF que da el banco para leer el corte y sus movimientos, y compararlos con lo que ya tienes en la app. La revisión se llama conciliación del import.",
    aliases: ["importación", "PDF del banco"],
    related: ["estado-de-cuenta", "conciliar"],
  },
]
