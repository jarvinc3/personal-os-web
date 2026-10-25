"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"
import { Bar, BarChart, XAxis } from "recharts"

const MONTHLY_SPEND = [
  { month: "ago", amount: 4200 },
  { month: "sep", amount: 5100 },
  { month: "oct", amount: 3850 },
] as const

const SPEND_CHART_CONFIG = {
  amount: { label: "Gasto", color: "var(--chart-1)" },
} satisfies ChartConfig

/** Gráficos de barras y anillos de progreso (#307). */
export function ChartsSection() {
  return (
    <>
      <GalleryDemo
        name="ChartContainer"
        importPath="@/src/shared/components/ui/chart"
        states="barras con tooltip y colores del tema"
        note="El contenedor aplica los colores de serie del tema claro y oscuro y el tooltip compartido."
      >
        <ChartContainer
          config={SPEND_CHART_CONFIG}
          className="aspect-[2/1] w-full"
        >
          <BarChart data={MONTHLY_SPEND}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
          </BarChart>
        </ChartContainer>
      </GalleryDemo>

      <GalleryDemo
        name="SubscriptionProgressRing"
        importPath="@/src/modules/finance/subscriptions/components/subscription-progress-ring"
        states="avance normal, ventana de aviso"
        note="El anillo rodea la marca de la suscripción y pinta el avance de su ciclo."
      >
        <div className="flex flex-wrap items-center gap-6">
          <SubscriptionProgressRing percent={40} size={40}>
            <BrandLogo name="Suscripción Ejemplo" size={40} />
          </SubscriptionProgressRing>
          <SubscriptionProgressRing percent={85} size={40} tone="warning">
            <BrandLogo name="Servicio Ejemplo" size={40} />
          </SubscriptionProgressRing>
          <SubscriptionProgressRing percent={100} size={24}>
            <BrandLogo name="Música Ejemplo" size={24} />
          </SubscriptionProgressRing>
        </div>
      </GalleryDemo>
    </>
  )
}
