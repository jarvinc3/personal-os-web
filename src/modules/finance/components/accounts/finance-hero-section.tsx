"use client"

import {
   mapStackItemsToDonutSlices,
   type DonutStackSlice,
} from "@/src/modules/finance/lib/donut-stack";
import type { InstitutionStackItem } from "@/src/modules/finance/lib/institution-stack";
import {
   formatCompactFinanceMoney,
   formatFinanceMoney,
   type FinanceMoneyDisplay,
} from "@/src/modules/finance/lib/money";
import {
   ChartContainer,
   type ChartConfig,
} from "@/src/shared/components/ui/chart";
import { useState } from "react";
import type { PieSectorShapeProps } from "recharts";
import { Label, Pie, PieChart, Sector } from "recharts";

type FinanceHeroSectionProps = {
   items: InstitutionStackItem[]
   display: FinanceMoneyDisplay
   isPending: boolean
   hasData: boolean
   netWorth: string | null
   netWorthComplete: boolean
}

function buildChartConfig(slices: DonutStackSlice[]): ChartConfig {
   const config: ChartConfig = {
      value: { label: "Balance" },
   }
   for (const slice of slices) {
      config[slice.key] = {
         label: slice.name,
         color: slice.fill,
      }
   }
   return config
}

function formatPercent(percent: number): string {
   return `${percent.toFixed(1)} %`
}

function ActiveDonutSector({
   index,
   activeIndex,
   outerRadius = 0,
   ...props
}: PieSectorShapeProps & { activeIndex: number | null }) {
   if (index === activeIndex) {
      return <Sector {...props} outerRadius={outerRadius + 12} />
   }
   return <Sector {...props} outerRadius={outerRadius} />
}

export function FinanceHeroSection({
   items,
   display,
   isPending,
   hasData,
   netWorth,
   netWorthComplete,
}: FinanceHeroSectionProps) {
   const slices = mapStackItemsToDonutSlices(items)
   const [activeKey, setActiveKey] = useState<string | null>(null)

   const activeIndex = activeKey
      ? slices.findIndex((slice) => slice.key === activeKey)
      : -1
   const activeSlice =
      activeIndex >= 0 ? (slices[activeIndex] ?? null) : null

   const chartConfig = buildChartConfig(slices)
   const chartId = "finance-net-worth-donut"

   const centerTitle = activeSlice
      ? activeSlice.kind === "cash"
         ? "Efectivo"
         : "Institución"
      : "Saldo"
   const signedDisplay = { ...display, leadingSign: true }
   const compactDisplay = { ...signedDisplay, compactNumbers: true }

   const netWorthFallback = (() => {
      if (isPending && !hasData) return "…"
      if (netWorthComplete) {
         return formatFinanceMoney(netWorth, signedDisplay)
      }
      return hasData ? "Balance incompleto" : "—"
   })()
   const compactNetWorthFallback = (() => {
      if (isPending && !hasData) return "…"
      if (netWorthComplete) {
         return formatCompactFinanceMoney(netWorth, compactDisplay)
      }
      return netWorthFallback
   })()
   const centerValue = activeSlice
      ? formatCompactFinanceMoney(activeSlice.signedValue, compactDisplay)
      : compactNetWorthFallback
   const centerSubtitle = activeSlice?.name ?? null

   return (
      <div className="flex flex-col gap-3">
         {slices.length === 0 ? (
            <div className="flex flex-col gap-1 items-center px-2 pb-2">
               <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Balance total
               </p>
               <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {netWorthFallback}
               </p>
            </div>
         ) : (
            <div className="relative mx-auto w-full max-w-sm">
               <ChartContainer
                  id={chartId}
                  config={chartConfig}
                  className="mx-auto w-full max-h-75 aspect-square"
                  initialDimension={{ width: 320, height: 320 }}
               >
                  <PieChart>
                     <Pie
                        data={slices}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="60%"
                        outerRadius="90%"
                        stroke="var(--background)"
                        strokeWidth={3}
                        paddingAngle={2}
                        isAnimationActive={false}
                        shape={(props: PieSectorShapeProps) => (
                           <ActiveDonutSector
                              {...props}
                              activeIndex={activeIndex >= 0 ? activeIndex : null}
                           />
                        )}
                        onClick={(_data, index) => {
                           const slice = slices[index]
                           if (!slice) return
                           setActiveKey((current) =>
                              current === slice.key ? null : slice.key,
                           )
                        }}
                        style={{ cursor: "pointer", outline: "none" }}
                        label={(props) => {
                           const slice = props.payload as DonutStackSlice | undefined
                           if (!slice || slice.percent < 6) return null
                           const { cx, cy, midAngle, innerRadius, outerRadius } = props
                           if (
                              cx == null ||
                              cy == null ||
                              midAngle == null ||
                              innerRadius == null ||
                              outerRadius == null
                           ) {
                              return null
                           }
                           const radius =
                              Number(innerRadius) +
                              (Number(outerRadius) - Number(innerRadius)) * 0.55
                           const x =
                              Number(cx) + radius * Math.cos((-midAngle * Math.PI) / 180)
                           const y =
                              Number(cy) + radius * Math.sin((-midAngle * Math.PI) / 180)
                           return (
                              <text
                                 x={x}
                                 y={y}
                                 textAnchor="middle"
                                 dominantBaseline="central"
                                 className="fill-white text-[10px] font-semibold"
                              >
                                 {formatPercent(slice.percent)}
                              </text>
                           )
                        }}
                        labelLine={false}
                     >
                        <Label
                           content={({ viewBox }) => {
                              if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                                 return null
                              }
                              const cx = viewBox.cx ?? 0
                              const cy = viewBox.cy ?? 0
                              return (
                                 <text
                                    x={cx}
                                    y={cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                 >
                                    <tspan
                                       x={cx}
                                       y={cy - (centerSubtitle ? 22 : 14)}
                                       className="fill-muted-foreground text-[10px] font-medium uppercase tracking-[0.14em]"
                                    >
                                       {centerTitle}
                                    </tspan>
                                    {centerSubtitle ? (
                                       <tspan
                                          x={cx}
                                          y={cy - 4}
                                          className="text-xs font-medium fill-foreground"
                                       >
                                          {centerSubtitle.length > 22
                                             ? `${centerSubtitle.slice(0, 20)}…`
                                             : centerSubtitle}
                                       </tspan>
                                    ) : null}
                                    <tspan
                                       x={cx}
                                       y={cy + (centerSubtitle ? 16 : 10)}
                                       className="text-lg font-bold tabular-nums fill-foreground"
                                    >
                                       {centerValue}
                                    </tspan>
                                 </text>
                              )
                           }}
                        />
                     </Pie>
                  </PieChart>
               </ChartContainer>
            </div>
         )}
      </div>
   )
}
