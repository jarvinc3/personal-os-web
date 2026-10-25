"use client"

import { GalleryDemo } from "@/src/modules/component-gallery/gallery-demo"
import { GALLERY_DISPLAY } from "@/src/modules/component-gallery/mock/values"
import { simulatedTap } from "@/src/modules/component-gallery/simulated-tap"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { FinanceSegmentedControl } from "@/src/modules/finance/shared/components/forms/form-blocks"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"
import { ArrowDownLeftIcon, ArrowUpRightIcon } from "lucide-react"
import { useState } from "react"

type Flow = "expense" | "income"

/** Tabs con indicador, controles segmentados y chips (#307). */
export function TabsSection() {
  const [tab, setTab] = useState("gastos")
  const [flow, setFlow] = useState<Flow>("expense")

  return (
    <>
      <GalleryDemo
        name="Tabs"
        from="@/src/shared/components/ui/tabs"
        states="indicador deslizante; variante line"
        note="En una pantalla de producto el tab se guarda en la query para que Atrás lo recupere. Aquí va sin persistencia."
      >
        <Tabs
          value={tab}
          onValueChange={(next) => setTab(next)}
          persist={false}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="gastos">Gastos</TabsTrigger>
            <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
          </TabsList>
          <TabsContent value="gastos" className="pt-1">
            <p className="text-sm text-muted-foreground">
              Panel de gastos del mes.
            </p>
          </TabsContent>
          <TabsContent value="ingresos" className="pt-1">
            <p className="text-sm text-muted-foreground">
              Panel de ingresos del mes.
            </p>
          </TabsContent>
        </Tabs>

        <Tabs defaultValue="uno" persist={false}>
          <TabsList variant="line">
            <TabsTrigger value="uno">Uno</TabsTrigger>
            <TabsTrigger value="dos">Dos</TabsTrigger>
            <TabsTrigger value="tres">Tres</TabsTrigger>
          </TabsList>
        </Tabs>
      </GalleryDemo>

      <GalleryDemo
        name="FinanceSegmentedControl"
        from="@/src/modules/finance/shared/components/forms/form-blocks"
        states="size sm, size lg, deshabilitado"
        note="Segmentos con icono para un filtro corto dentro de un formulario."
      >
        <FinanceSegmentedControl<Flow>
          value={flow}
          onChange={setFlow}
          options={[
            { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
            { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
          ]}
        />
        <FinanceSegmentedControl<Flow>
          value="income"
          onChange={() => {}}
          size="lg"
          fullWidth
          options={[
            { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
            { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
          ]}
        />
        <FinanceSegmentedControl<Flow>
          value="expense"
          onChange={() => {}}
          disabled
          options={[
            { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
            { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
          ]}
        />
      </GalleryDemo>

      <GalleryDemo
        name="Badge"
        from="@/src/shared/components/ui/badge"
        states="default, secondary, success, warning, info, danger, outline"
        note="Píldoras de estado y conteo. No son un botón."
      >
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Al día</Badge>
          <Badge variant="warning">Por vencer</Badge>
          <Badge variant="info">Nuevo</Badge>
          <Badge variant="danger">Vencido</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </GalleryDemo>

      <GalleryDemo
        name="CategoryCard"
        from="@/src/modules/finance/shared/components/category-card"
        states='variant="chip" con importe, sin color, nombre largo'
        note="El chip es la mención de una categoría en una fila o un resumen."
      >
        <div className="flex flex-wrap items-center gap-2">
          <CategoryCard
            name="Mercado"
            icon={null}
            color="#0f766e"
            isSystem={false}
            amount={formatFinanceMoney("1250.00", GALLERY_DISPLAY)}
            variant="chip"
            onPress={simulatedTap}
          />
          <CategoryCard
            name="Sin color"
            icon={null}
            color={null}
            isSystem={false}
            variant="chip"
          />
          <div className="w-44 min-w-0">
            <CategoryCard
              name="Suscripciones y servicios digitales"
              icon={null}
              color="#7c3aed"
              isSystem={false}
              variant="chip"
            />
          </div>
        </div>
      </GalleryDemo>
    </>
  )
}
