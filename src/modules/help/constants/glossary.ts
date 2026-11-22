import type {
  HelpTerm,
  HelpTermCategoryId,
} from "@/src/modules/help/types/help.types"

import { GENERAL_TERMS } from "@/src/modules/help/constants/glossary/general"
import { DINERO_TERMS } from "@/src/modules/help/constants/glossary/dinero"
import { PRODUCTOS_TERMS } from "@/src/modules/help/constants/glossary/productos"
import { MOVIMIENTOS_TERMS } from "@/src/modules/help/constants/glossary/movimientos"
import { PLANIFICACION_TERMS } from "@/src/modules/help/constants/glossary/planificacion"
import { CORREO_TERMS } from "@/src/modules/help/constants/glossary/correo"

export const HELP_TERM_CATEGORIES: readonly {
  id: HelpTermCategoryId
  label: string
}[] = [
  { id: "general", label: "La app" },
  { id: "dinero", label: "Dinero y patrimonio" },
  { id: "productos", label: "Cuentas, tarjetas y productos" },
  { id: "movimientos", label: "Movimientos" },
  { id: "planificacion", label: "Planificación" },
  { id: "correo", label: "Correo y banco" },
]

export const HELP_TERMS: readonly HelpTerm[] = [
  ...GENERAL_TERMS,
  ...DINERO_TERMS,
  ...PRODUCTOS_TERMS,
  ...MOVIMIENTOS_TERMS,
  ...PLANIFICACION_TERMS,
  ...CORREO_TERMS,
]
