import { Bar, BarChart, XAxis } from "recharts"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

const MONTHLY_SPEND = [
  { month: "ago", amount: 4200 },
  { month: "sep", amount: 5100 },
  { month: "oct", amount: 3850 },
] as const

const SPEND_CHART_CONFIG = {
  amount: { label: "Gasto", color: "var(--chart-1)" },
} satisfies ChartConfig

export const graficosDemos: GalleryDemoMap = {
  "chart-container": [
    {
      label: "Barras con tooltip y colores del tema",
      node: (
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
      ),
    },
  ],
  "progress-ring": [
    {
      label: "Avance bajo, medio, completo y con color de entidad",
      node: (
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
      ),
    },
  ],
  "subscription-progress-ring": [
    {
      label: "Avance normal, ventana de aviso y tamaño pequeño",
      node: (
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
      ),
    },
  ],
}
