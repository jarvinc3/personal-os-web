"use client"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"
import { ChartColumnIcon } from "lucide-react"

export function UsageEmpty() {
  return (
    <Empty className="rounded-2xl border border-border bg-card p-6">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ChartColumnIcon />
        </EmptyMedia>
        <EmptyTitle>Sin clasificaciones en este rango</EmptyTitle>
        <EmptyDescription>
          No hay llamadas de clasificación registradas en este rango. Cambia el
          rango o vuelve más tarde.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
