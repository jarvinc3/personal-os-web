"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import { ProgressRing } from "@/src/shared/components/ui/progress-ring"
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
        name="ProgressRing"
        importPath="@/src/shared/components/ui/progress-ring"
        states="avance bajo, medio y completo; con color de entidad"
        note="El único anillo de una sola medida. El de suscripciones y el de una meta lo usan; el gráfico de varios segmentos es otro componente."
      >
        <div className="flex flex-wrap items-center gap-4">
          <ProgressRing
            value={25}
            size={56}
            thickness={4}
            arcClassName="stroke-primary"
          >
            <span className="text-[11px] font-semibold tabular-nums">25%</span>
          </ProgressRing>
          <ProgressRing
            value={70}
            size={56}
            thickness={4}
            arcClassName="stroke-success"
          >
            <span className="text-[11px] font-semibold tabular-nums">70%</span>
          </ProgressRing>
          <ProgressRing value={100} size={56} thickness={4} color="#0f766e">
            <span className="text-[11px] font-semibold tabular-nums">100%</span>
          </ProgressRing>
        </div>
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
