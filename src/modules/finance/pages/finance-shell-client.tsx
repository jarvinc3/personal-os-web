"use client"

import { FinanceAuthenticatedPage } from "@/src/modules/finance/components/finance-authenticated-page"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { LandmarkIcon } from "lucide-react"

export function FinanceShellClient() {
  return (
    <FinanceAuthenticatedPage>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <LandmarkIcon />
          </EmptyMedia>
          <EmptyTitle>Todavía no hay resumen</EmptyTitle>
          <EmptyDescription>
            El dashboard de patrimonio y gasto llega en el siguiente corte.
            Mientras tanto puedes moverte por Finanzas desde el menú.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </FinanceAuthenticatedPage>
  )
}
