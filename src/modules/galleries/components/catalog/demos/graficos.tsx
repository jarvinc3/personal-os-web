import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
} from "recharts"

import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"
import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/src/shared/components/ui/chart"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

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
      code: `
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
`,
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
      code: `
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
`,
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
      code: `
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
`,
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

const SPEND_SHARE = [
  { name: "ago", amount: 4200 },
  { name: "sep", amount: 1800 },
  { name: "oct", amount: 900 },
] as const

const SHARE_CONFIG = {
  ago: { label: "Ago", color: "var(--chart-1)" },
  sep: { label: "Sep", color: "var(--chart-2)" },
  oct: { label: "Oct", color: "var(--chart-3)" },
} satisfies ChartConfig

const SPEND_SERIES = [
  { month: "ago", spent: 4200, budget: 5000 },
  { month: "sep", spent: 5100, budget: 5000 },
  { month: "oct", spent: 3850, budget: 5000 },
] as const

const AMOUNT_CONFIG = {
  amount: { label: "Gasto", color: "var(--chart-1)" },
} satisfies ChartConfig

const SERIES_CONFIG = {
  spent: { label: "Gasto", color: "var(--chart-1)" },
  budget: { label: "Presupuesto", color: "var(--chart-2)" },
} satisfies ChartConfig

const CHART_MARGIN = { left: 8, right: 8 }

const AXIS_PADDING = { left: 12, right: 12 }

export const graficosVariantDemos: GalleryVariantDemoMap = {
  "chart-container": {
    config: [
      {
        label: "label y color por serie",
        node: (
          <ChartContainer
            config={SERIES_CONFIG}
            className="aspect-[2/1] w-full max-w-xs"
          >
            <BarChart data={SPEND_SERIES} margin={CHART_MARGIN}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="spent" fill="var(--color-spent)" radius={4} />
              <Bar dataKey="budget" fill="var(--color-budget)" radius={4} />
            </BarChart>
          </ChartContainer>
        ),
      },
    ],
    tipo: [
      {
        label: "bar",
        node: (
          <ChartContainer
            config={AMOUNT_CONFIG}
            className="aspect-[2/1] w-full max-w-xs"
          >
            <BarChart data={MONTHLY_SPEND} margin={CHART_MARGIN}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
            </BarChart>
          </ChartContainer>
        ),
      },
      {
        label: "line",
        node: (
          <ChartContainer
            config={AMOUNT_CONFIG}
            className="aspect-[2/1] w-full max-w-xs"
          >
            <LineChart data={MONTHLY_SPEND} margin={CHART_MARGIN}>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={AXIS_PADDING}
              />
              <Line
                dataKey="amount"
                stroke="var(--color-amount)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ),
      },
      {
        label: "area",
        node: (
          <ChartContainer
            config={AMOUNT_CONFIG}
            className="aspect-[2/1] w-full max-w-xs"
          >
            <AreaChart data={MONTHLY_SPEND} margin={CHART_MARGIN}>
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                padding={AXIS_PADDING}
              />
              <Area
                dataKey="amount"
                stroke="var(--color-amount)"
                fill="var(--color-amount)"
                fillOpacity={0.25}
              />
            </AreaChart>
          </ChartContainer>
        ),
      },
      {
        label: "pie",
        node: (
          <ChartContainer
            config={SHARE_CONFIG}
            className="aspect-square size-40"
          >
            <PieChart>
              <Pie
                data={SPEND_SHARE}
                dataKey="amount"
                nameKey="name"
                innerRadius={28}
                outerRadius={60}
              >
                {SPEND_SHARE.map((slice) => (
                  <Cell key={slice.name} fill={`var(--color-${slice.name})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        ),
      },
    ],
  },
  "progress-ring": {
    value: [
      {
        label: "0",
        node: (
          <ProgressRing value={0} size={56} thickness={4}>
            <span className="text-[11px] font-semibold tabular-nums">0%</span>
          </ProgressRing>
        ),
      },
      {
        label: "50",
        node: (
          <ProgressRing value={50} size={56} thickness={4}>
            <span className="text-[11px] font-semibold tabular-nums">50%</span>
          </ProgressRing>
        ),
      },
      {
        label: "100",
        node: (
          <ProgressRing value={100} size={56} thickness={4}>
            <span className="text-[11px] font-semibold tabular-nums">100%</span>
          </ProgressRing>
        ),
      },
      {
        label: "140 (se recorta a 100)",
        node: (
          <ProgressRing value={140} size={56} thickness={4}>
            <span className="text-[11px] font-semibold tabular-nums">140</span>
          </ProgressRing>
        ),
      },
    ],
    "arcClassName / color": [
      {
        label: "token del tema",
        node: (
          <ProgressRing
            value={70}
            size={56}
            thickness={4}
            arcClassName="stroke-success"
          >
            <span className="text-[11px] font-semibold tabular-nums">70%</span>
          </ProgressRing>
        ),
      },
      {
        label: "acento de entidad",
        node: (
          <ProgressRing value={70} size={56} thickness={4} color="#0f766e">
            <span className="text-[11px] font-semibold tabular-nums">70%</span>
          </ProgressRing>
        ),
      },
    ],
  },
  "subscription-progress-ring": {
    tone: [
      {
        label: "default",
        node: (
          <SubscriptionProgressRing percent={40} size={40}>
            <BrandLogo name="Suscripción Ejemplo" size={40} />
          </SubscriptionProgressRing>
        ),
      },
      {
        label: "warning",
        node: (
          <SubscriptionProgressRing percent={85} size={40} tone="warning">
            <BrandLogo name="Servicio Ejemplo" size={40} />
          </SubscriptionProgressRing>
        ),
      },
    ],
    size: [
      {
        label: "40",
        node: (
          <SubscriptionProgressRing percent={60} size={40}>
            <BrandLogo name="Suscripción Ejemplo" size={40} />
          </SubscriptionProgressRing>
        ),
      },
      {
        label: "24",
        node: (
          <SubscriptionProgressRing percent={60} size={24}>
            <BrandLogo name="Música Ejemplo" size={24} />
          </SubscriptionProgressRing>
        ),
      },
    ],
  },
}
