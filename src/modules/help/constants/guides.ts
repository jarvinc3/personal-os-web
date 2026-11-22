import type {
  HelpGuide,
  HelpGuideGroupId,
} from "@/src/modules/help/types/help.types"

import { INSTALLATION_GUIDES } from "@/src/modules/help/constants/guides/installation"
import { FIRST_STEPS_GUIDES } from "@/src/modules/help/constants/guides/first-steps"
import { RECONCILIATION_GUIDES } from "@/src/modules/help/constants/guides/reconciliation"
import { PLANNING_GUIDES } from "@/src/modules/help/constants/guides/planning"
import { FINANCE_GUIDES } from "@/src/modules/help/constants/guides/finance"
import { NOTIFICATIONS_GUIDES } from "@/src/modules/help/constants/guides/notifications"

export const HELP_GUIDE_GROUPS: readonly {
  id: HelpGuideGroupId
  title: string
  description: string
}[] = [
  {
    id: "instalacion",
    title: "Instalar la app",
    description: "Añádela a tu teléfono o escritorio y recibe avisos.",
  },
  {
    id: "primeros-pasos",
    title: "Primeros pasos",
    description: "De la cuenta nueva al primer movimiento.",
  },
  {
    id: "apps",
    title: "Guías de cada app",
    description: "Finanzas, conciliación, planificación y avisos.",
  },
]

export const HELP_GUIDES: readonly HelpGuide[] = [
  ...INSTALLATION_GUIDES,
  ...FIRST_STEPS_GUIDES,
  ...RECONCILIATION_GUIDES,
  ...PLANNING_GUIDES,
  ...FINANCE_GUIDES,
  ...NOTIFICATIONS_GUIDES,
]
