import { CheckIcon, PlusIcon } from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import {
  GALLERY_ACCENT,
  GALLERY_DISPLAY,
} from "@/src/modules/galleries/components/mock/values"
import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import { Badge } from "@/src/shared/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

export const tabsDemos: GalleryDemoMap = {
  tabs: [
    {
      label: "Indicador deslizante y variante line",
      code: `
<div className="flex w-full flex-col gap-4">
  <Tabs defaultValue="gastos" className="w-full">
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
  <Tabs defaultValue="uno">
    <TabsList variant="line">
      <TabsTrigger value="uno">Uno</TabsTrigger>
      <TabsTrigger value="dos">Dos</TabsTrigger>
      <TabsTrigger value="tres">Tres</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
`,
      node: (
        <div className="flex w-full flex-col gap-4">
          <Tabs defaultValue="gastos" className="w-full">
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
          <Tabs defaultValue="uno">
            <TabsList variant="line">
              <TabsTrigger value="uno">Uno</TabsTrigger>
              <TabsTrigger value="dos">Dos</TabsTrigger>
              <TabsTrigger value="tres">Tres</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      ),
    },
  ],
  badge: [
    {
      label: "Variantes y estados",
      code: `
<div className="flex flex-wrap gap-2">
  <Badge>Default</Badge>
  <Badge variant="secondary">Secondary</Badge>
  <Badge variant="success">Al día</Badge>
  <Badge variant="warning">Por vencer</Badge>
  <Badge variant="info">Nuevo</Badge>
  <Badge variant="danger">Vencido</Badge>
  <Badge variant="tinted" className="bg-accent">
    Tinted
  </Badge>
  <Badge variant="outline">Outline</Badge>
</div>
`,
      node: (
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Al día</Badge>
          <Badge variant="warning">Por vencer</Badge>
          <Badge variant="info">Nuevo</Badge>
          <Badge variant="danger">Vencido</Badge>
          <Badge variant="tinted" className="bg-accent">
            Tinted
          </Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      ),
    },
  ],
  "category-card": [
    {
      label: "Chip con importe, sin color y nombre largo",
      code: `
<div className="flex flex-wrap items-center gap-2">
  <CategoryCard
    name="Mercado"
    icon={null}
    color={"#0f766e"}
    isSystem={false}
    amount={formatFinanceMoney("1250.00", { currency: "DOP", showCents: true, compactNumbers: false, locale: "es-DO" })}
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
`,
      node: (
        <div className="flex flex-wrap items-center gap-2">
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
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
      ),
    },
  ],
}

export const tabsVariantDemos: GalleryVariantDemoMap = {
  tabs: {
    "variant (TabsList)": [
      {
        label: "default",
        node: (
          <Tabs defaultValue="gastos">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        label: "line",
        node: (
          <Tabs defaultValue="gastos">
            <TabsList variant="line">
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
    ],
    orientation: [
      {
        label: "horizontal",
        node: (
          <Tabs defaultValue="gastos">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        label: "vertical",
        node: (
          <Tabs orientation="vertical" defaultValue="gastos">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
    ],
    states: [
      {
        label: "active",
        node: (
          <Tabs defaultValue="gastos">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        label: "inactive",
        node: (
          <Tabs value="">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
      {
        label: "disabled",
        node: (
          <Tabs defaultValue="gastos">
            <TabsList>
              <TabsTrigger value="gastos">Gastos</TabsTrigger>
              <TabsTrigger value="ingresos" disabled>
                Ingresos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ),
      },
    ],
  },
  badge: {
    variant: [
      { label: "default", node: <Badge>Default</Badge> },
      {
        label: "secondary",
        node: <Badge variant="secondary">Secondary</Badge>,
      },
      { label: "success", node: <Badge variant="success">Al día</Badge> },
      { label: "warning", node: <Badge variant="warning">Por vencer</Badge> },
      { label: "info", node: <Badge variant="info">Nuevo</Badge> },
      { label: "danger", node: <Badge variant="danger">Vencido</Badge> },
      {
        label: "tinted",
        node: (
          <Badge variant="tinted" className="bg-accent">
            Tinted
          </Badge>
        ),
      },
      { label: "outline", node: <Badge variant="outline">Outline</Badge> },
      {
        label: "destructive",
        node: <Badge variant="destructive">Falló</Badge>,
      },
      { label: "ghost", node: <Badge variant="ghost">Ghost</Badge> },
      {
        label: "link",
        node: (
          <Badge variant="link">
            <PlusIcon />
            Link
          </Badge>
        ),
      },
    ],
  },
  "category-card": {
    variant: [
      {
        label: "default",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            onPress={simulatedTap}
          />
        ),
      },
      {
        label: "pick",
        node: (
          <CategoryCard
            name="Nueva categoría"
            icon={null}
            isSystem={false}
            variant="pick"
            leading={<PlusIcon className="size-5" />}
            onPress={simulatedTap}
          />
        ),
      },
      {
        label: "chip",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            amount={formatFinanceMoney("1250.00", GALLERY_DISPLAY)}
            variant="chip"
            onPress={simulatedTap}
          />
        ),
      },
      {
        label: "inline",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            amount={formatFinanceMoney("1250.00", GALLERY_DISPLAY)}
            variant="inline"
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            onPress={simulatedTap}
          />
        ),
      },
      {
        label: "selected",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            leading={<CheckIcon className="size-4 text-primary" aria-hidden />}
            onPress={simulatedTap}
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <CategoryCard
            name="Mercado"
            icon={null}
            color={GALLERY_ACCENT}
            isSystem={false}
            disabled
            onPress={simulatedTap}
          />
        ),
      },
    ],
  },
}
