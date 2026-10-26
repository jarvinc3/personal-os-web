"use client"

import type { PlanningTab } from "@/src/modules/finance/planning/lib/planning-tabs"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { ExpandableFab } from "@/src/shared/components/fab/expandable-fab"
import {
  ChartPieIcon,
  HandCoinsIcon,
  HandshakeIcon,
  PiggyBankIcon,
} from "lucide-react"

type PlanningCreateFabProps = {
  enabled: boolean
  hasExpenseCategories: boolean
  loanPending: boolean
  onOpenCreate: (tab: PlanningTab) => void
}

export function PlanningCreateFab({
  enabled,
  hasExpenseCategories,
  loanPending,
  onOpenCreate,
}: PlanningCreateFabProps) {
  return (
    <ExpandableFab
      label="Acciones de Planificación"
      actions={[
        {
          icon: <PiggyBankIcon className="size-5" />,
          label: "Ahorro",
          onClick: () => onOpenCreate("savings"),
          disabled: !enabled,
          color: "bg-emerald-600",
        },
        {
          icon: <ChartPieIcon className="size-5" />,
          label: "Presup...",
          onClick: () => onOpenCreate("budgets"),
          disabled: !enabled || !hasExpenseCategories,
          color: "bg-violet-600",
        },
        {
          icon: <HandshakeIcon className="size-5" />,
          label: "Cobro",
          onClick: () => onOpenCreate("receivables"),
          disabled: !enabled,
          color: "bg-blue-500",
        },
        {
          icon: loanPending ? (
            <Spinner className="size-5" />
          ) : (
            <HandCoinsIcon className="size-5" />
          ),
          label: "Préstamo",
          onClick: () => onOpenCreate("loans"),
          disabled: !enabled || loanPending,
          color: "bg-amber-600",
        },
      ]}
    />
  )
}
