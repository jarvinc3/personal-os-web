import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const graficosDocs: readonly GalleryComponentMeta[] = [
  {
    id: "chart-container",
    name: "ChartContainer",
    category: "graficos",
    kind: "ui",
    description:
      "Contenedor de Recharts con los colores de serie del tema y el tooltip compartido.",
    whenToUse:
      "Un gráfico de barras, línea o área con las series del tema claro y oscuro.",
    whenNotToUse:
      "Un anillo de una sola medida: ProgressRing. Varios segmentos de anillo: FinanceRingChart.",
    importPath: "@/src/shared/components/ui/chart",
    snippet: `import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/src/shared/components/ui/chart"

<ChartContainer config={config}>
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="amount" fill="var(--color-amount)" />
  </BarChart>
</ChartContainer>`,
    subcomponents: [
      "ChartTooltip",
      "ChartTooltipContent",
      "ChartLegend",
      "ChartLegendContent",
      "ChartStyle",
    ],
    anatomy: [
      {
        name: "ChartContainer",
        children: [
          {
            name: "BarChart",
            children: [
              { name: "XAxis" },
              { name: "ChartTooltip" },
              { name: "Bar" },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "config", values: "label y color por serie" },
      { name: "tipo", values: "bar, line, area, pie" },
    ],
    props: [
      {
        name: "config",
        type: "ChartConfig",
        description: "Etiqueta y color de cada serie.",
      },
      {
        name: "className",
        type: "string",
        description: "Aspecto y alto del gráfico.",
      },
    ],
  },
  {
    id: "progress-ring",
    name: "ProgressRing",
    category: "graficos",
    kind: "domain",
    description:
      "Anillo de una sola medida con diámetro, grosor, valor y color.",
    whenToUse:
      "El avance de una meta, un presupuesto o un ciclo dentro de una card o un detalle.",
    whenNotToUse:
      "Varios segmentos: FinanceRingChart. Una barra de progreso lineal.",
    importPath: "@/src/shared/components/data-display/progress-ring",
    snippet: `import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"

<ProgressRing value={70} size={56} thickness={4} arcClassName="stroke-success">
  <span className="tabular-nums">70%</span>
</ProgressRing>`,
    subcomponents: [],
    anatomy: [{ name: "ProgressRing" }],
    variants: [
      { name: "value", values: "0 a 100; fuera de rango se recorta" },
      {
        name: "arcClassName / color",
        values: "token del tema o acento de entidad",
      },
    ],
    props: [
      {
        name: "value",
        type: "number",
        description: "Porcentaje de avance.",
      },
      {
        name: "size / thickness",
        type: "number",
        description: "Diámetro y grosor en px.",
      },
      {
        name: "arcClassName / color",
        type: "string",
        description: "Color del arco; color gana sobre la clase.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Contenido del centro, como el porcentaje.",
      },
    ],
  },
  {
    id: "subscription-progress-ring",
    name: "SubscriptionProgressRing",
    category: "graficos",
    kind: "domain",
    description:
      "Anillo que rodea la marca de una suscripción y pinta el avance de su ciclo.",
    whenToUse: "La marca de una suscripción con su ciclo consumido.",
    whenNotToUse: "Un avance sin marca: ProgressRing.",
    importPath:
      "@/src/modules/finance/subscriptions/components/subscription-progress-ring",
    snippet: `import { SubscriptionProgressRing } from "@/src/modules/finance/subscriptions/components/subscription-progress-ring"

<SubscriptionProgressRing percent={85} size={40} tone="warning">
  <BrandLogo name={name} size={40} />
</SubscriptionProgressRing>`,
    subcomponents: [],
    anatomy: [
      { name: "SubscriptionProgressRing", children: [{ name: "BrandLogo" }] },
    ],
    variants: [
      { name: "tone", values: "default, warning" },
      { name: "size", values: "40, 24" },
    ],
    props: [
      {
        name: "percent",
        type: "number",
        description: "Avance del ciclo.",
      },
      {
        name: "tone",
        type: "string",
        description: "Color de aviso cuando el ciclo está por vencer.",
      },
      {
        name: "size",
        type: "number",
        description: "Diámetro del anillo y de la marca.",
      },
    ],
  },
]
