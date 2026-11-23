import { useState } from "react"
import Link from "next/link"
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  type LucideIcon,
} from "lucide-react"

import { simulatedTap } from "@/src/modules/galleries/components/simulated-tap"
import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"
import { PendingSurface } from "@/src/shared/components/shell/navigation-pending"
import { Button, buttonVariants } from "@/src/shared/components/ui/button"
import { ButtonGroup } from "@/src/shared/components/ui/button-group"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Toggle } from "@/src/shared/components/ui/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

type Flow = "expense" | "income"

type FlowSegment = { value: Flow; label: string; icon: LucideIcon }

const FLOW_SEGMENTS: FlowSegment[] = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
  { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
]

function SegmentedControlDemo() {
  const [flow, setFlow] = useState<Flow>("expense")

  return (
    <div className="flex w-full flex-col gap-3">
      <SegmentedControl<Flow>
        value={flow}
        onChange={setFlow}
        options={FLOW_SEGMENTS}
      />
      <SegmentedControl<Flow>
        value="income"
        onChange={() => {}}
        size="lg"
        fullWidth
        options={FLOW_SEGMENTS}
      />
      <SegmentedControl<Flow>
        value="expense"
        onChange={() => {}}
        disabled
        options={FLOW_SEGMENTS}
      />
    </div>
  )
}

export const accionesDemos: GalleryDemoMap = {
  button: [
    {
      label: "Variantes",
      code: `
<div className="flex flex-wrap gap-2">
  <Button onClick={() => simulatedTap("Guardar")}>
    <SaveIcon />
    Guardar
  </Button>
  <Button variant="outline" onClick={() => simulatedTap("Editar")}>
    <PencilIcon />
    Editar
  </Button>
  <Button variant="secondary" onClick={() => simulatedTap("Agregar")}>
    <PlusIcon />
    Agregar
  </Button>
  <Button variant="ghost" onClick={() => simulatedTap("Más")}>
    <EllipsisVerticalIcon />
    Más
  </Button>
  <Button
    variant="destructive"
    onClick={() => simulatedTap("Eliminar")}
  >
    <Trash2Icon />
    Eliminar
  </Button>
  <Button variant="link" onClick={() => simulatedTap("Ver detalle")}>
    Ver detalle
  </Button>
</div>
`,
      node: (
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => simulatedTap("Guardar")}>
            <SaveIcon />
            Guardar
          </Button>
          <Button variant="outline" onClick={() => simulatedTap("Editar")}>
            <PencilIcon />
            Editar
          </Button>
          <Button variant="secondary" onClick={() => simulatedTap("Agregar")}>
            <PlusIcon />
            Agregar
          </Button>
          <Button variant="ghost" onClick={() => simulatedTap("Más")}>
            <EllipsisVerticalIcon />
            Más
          </Button>
          <Button
            variant="destructive"
            onClick={() => simulatedTap("Eliminar")}
          >
            <Trash2Icon />
            Eliminar
          </Button>
          <Button variant="link" onClick={() => simulatedTap("Ver detalle")}>
            Ver detalle
          </Button>
        </div>
      ),
    },
    {
      label: "Tamaños",
      code: `
<div className="flex flex-wrap items-center gap-2">
  <Button size="sm" onClick={() => simulatedTap("Pequeño")}>
    <PlusIcon />
    Pequeño
  </Button>
  <Button size="default" onClick={() => simulatedTap("Mediano")}>
    <PlusIcon />
    Mediano
  </Button>
  <Button size="lg" onClick={() => simulatedTap("Grande")}>
    <PlusIcon />
    Grande
  </Button>
  <Button
    size="icon"
    aria-label="Más acciones"
    onClick={() => simulatedTap("Solo icono")}
  >
    <EllipsisVerticalIcon />
  </Button>
  <Button
    size="icon-sm"
    aria-label="Editar"
    onClick={() => simulatedTap("Solo icono pequeño")}
  >
    <PencilIcon />
  </Button>
  <Button
    size="icon-lg"
    aria-label="Eliminar"
    variant="destructive"
    onClick={() => simulatedTap("Solo icono grande")}
  >
    <Trash2Icon />
  </Button>
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => simulatedTap("Pequeño")}>
            <PlusIcon />
            Pequeño
          </Button>
          <Button size="default" onClick={() => simulatedTap("Mediano")}>
            <PlusIcon />
            Mediano
          </Button>
          <Button size="lg" onClick={() => simulatedTap("Grande")}>
            <PlusIcon />
            Grande
          </Button>
          <Button
            size="icon"
            aria-label="Más acciones"
            onClick={() => simulatedTap("Solo icono")}
          >
            <EllipsisVerticalIcon />
          </Button>
          <Button
            size="icon-sm"
            aria-label="Editar"
            onClick={() => simulatedTap("Solo icono pequeño")}
          >
            <PencilIcon />
          </Button>
          <Button
            size="icon-lg"
            aria-label="Eliminar"
            variant="destructive"
            onClick={() => simulatedTap("Solo icono grande")}
          >
            <Trash2Icon />
          </Button>
        </div>
      ),
    },
    {
      label: "Pending y deshabilitado",
      code: `
<div className="flex flex-wrap gap-2">
  <Button disabled>
    <Spinner />
    Guardando
  </Button>
  <Button variant="outline" disabled>
    <SaveIcon />
    Deshabilitado
  </Button>
</div>
`,
      node: (
        <div className="flex flex-wrap gap-2">
          <Button disabled>
            <Spinner />
            Guardando
          </Button>
          <Button variant="outline" disabled>
            <SaveIcon />
            Deshabilitado
          </Button>
        </div>
      ),
    },
    {
      label: "Como Link",
      code: `
<Link
  href={APP_ROUTES.app.settingsAppearance}
  className={cn(buttonVariants({ variant: "outline" }))}
>
  <ChevronLeftIcon />
  Volver a Apariencia
</Link>
`,
      node: (
        <Link
          href={APP_ROUTES.app.settingsAppearance}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <ChevronLeftIcon />
          Volver a Apariencia
        </Link>
      ),
    },
  ],
  "button-group": [
    {
      label: "Horizontal y vertical",
      code: `
<div className="flex flex-wrap items-center gap-3">
  <ButtonGroup>
    <Button variant="outline" onClick={() => simulatedTap("Editar")}>
      <PencilIcon />
      Editar
    </Button>
    <Button variant="outline" onClick={() => simulatedTap("Más")}>
      <EllipsisVerticalIcon />
    </Button>
  </ButtonGroup>
  <ButtonGroup orientation="vertical">
    <Button variant="outline" onClick={() => simulatedTap("Subir")}>
      <ArrowUpRightIcon />
      Subir
    </Button>
    <Button variant="outline" onClick={() => simulatedTap("Bajar")}>
      <ArrowDownLeftIcon />
      Bajar
    </Button>
  </ButtonGroup>
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <ButtonGroup>
            <Button variant="outline" onClick={() => simulatedTap("Editar")}>
              <PencilIcon />
              Editar
            </Button>
            <Button variant="outline" onClick={() => simulatedTap("Más")}>
              <EllipsisVerticalIcon />
            </Button>
          </ButtonGroup>
          <ButtonGroup orientation="vertical">
            <Button variant="outline" onClick={() => simulatedTap("Subir")}>
              <ArrowUpRightIcon />
              Subir
            </Button>
            <Button variant="outline" onClick={() => simulatedTap("Bajar")}>
              <ArrowDownLeftIcon />
              Bajar
            </Button>
          </ButtonGroup>
        </div>
      ),
    },
  ],
  toggle: [
    {
      label: "Apagado, pulsado y deshabilitado",
      code: `
<div className="flex flex-wrap items-center gap-2">
  <Toggle
    aria-label="Añadir a favoritos"
    onClick={() => simulatedTap("Favorito")}
  >
    <PlusIcon />
  </Toggle>
  <Toggle defaultPressed aria-label="Favorito activo">
    <SaveIcon />
  </Toggle>
  <Toggle disabled aria-label="No disponible">
    <PencilIcon />
  </Toggle>
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            aria-label="Añadir a favoritos"
            onClick={() => simulatedTap("Favorito")}
          >
            <PlusIcon />
          </Toggle>
          <Toggle defaultPressed aria-label="Favorito activo">
            <SaveIcon />
          </Toggle>
          <Toggle disabled aria-label="No disponible">
            <PencilIcon />
          </Toggle>
        </div>
      ),
    },
  ],
  "toggle-group": [
    {
      label: "Exclusivo y múltiple",
      code: `
<div className="flex flex-col gap-3">
  <ToggleGroup defaultValue={["expense"]} aria-label="Tipo">
    <ToggleGroupItem value="expense" aria-label="Gasto">
      <ArrowDownLeftIcon />
      Gasto
    </ToggleGroupItem>
    <ToggleGroupItem value="income" aria-label="Ingreso">
      <ArrowUpRightIcon />
      Ingreso
    </ToggleGroupItem>
  </ToggleGroup>
  <ToggleGroup
    multiple
    defaultValue={["saving"]}
    aria-label="Etiquetas"
  >
    <ToggleGroupItem value="saving">Ahorro</ToggleGroupItem>
    <ToggleGroupItem value="fixed">Fijo</ToggleGroupItem>
    <ToggleGroupItem value="variable">Variable</ToggleGroupItem>
  </ToggleGroup>
</div>
`,
      node: (
        <div className="flex flex-col gap-3">
          <ToggleGroup defaultValue={["expense"]} aria-label="Tipo">
            <ToggleGroupItem value="expense" aria-label="Gasto">
              <ArrowDownLeftIcon />
              Gasto
            </ToggleGroupItem>
            <ToggleGroupItem value="income" aria-label="Ingreso">
              <ArrowUpRightIcon />
              Ingreso
            </ToggleGroupItem>
          </ToggleGroup>
          <ToggleGroup
            multiple
            defaultValue={["saving"]}
            aria-label="Etiquetas"
          >
            <ToggleGroupItem value="saving">Ahorro</ToggleGroupItem>
            <ToggleGroupItem value="fixed">Fijo</ToggleGroupItem>
            <ToggleGroupItem value="variable">Variable</ToggleGroupItem>
          </ToggleGroup>
        </div>
      ),
    },
  ],
  "segmented-control": [
    {
      label: "sm, lg y deshabilitado",
      code: `
const [flow, setFlow] = useState("expense")

const FLOW_SEGMENTS = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
  { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
]

<div className="flex w-full flex-col gap-3">
  <SegmentedControl value={flow} onChange={setFlow} options={FLOW_SEGMENTS} />
  <SegmentedControl
    value="income"
    onChange={() => {}}
    size="lg"
    fullWidth
    options={FLOW_SEGMENTS}
  />
  <SegmentedControl
    value="expense"
    onChange={() => {}}
    disabled
    options={FLOW_SEGMENTS}
  />
</div>
`,
      node: <SegmentedControlDemo />,
    },
  ],
  "pending-surface": [
    {
      label: "En reposo y con la navegación pendiente",
      code: `
<div className="flex flex-wrap items-center gap-3">
  <Button
    variant="outline"
    onClick={() => simulatedTap("Abrir detalle")}
  >
    <ChevronRightIcon />
    Abrir detalle
  </Button>
  <div className="relative overflow-hidden rounded-lg">
    <Button
      variant="outline"
      onClick={() => simulatedTap("Abrir detalle")}
    >
      <ChevronRightIcon />
      Abrir detalle
    </Button>
    <PendingSurface />
  </div>
</div>
`,
      node: (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => simulatedTap("Abrir detalle")}
          >
            <ChevronRightIcon />
            Abrir detalle
          </Button>
          <div className="relative overflow-hidden rounded-lg">
            <Button
              variant="outline"
              onClick={() => simulatedTap("Abrir detalle")}
            >
              <ChevronRightIcon />
              Abrir detalle
            </Button>
            <PendingSurface />
          </div>
        </div>
      ),
    },
  ],
}

export const accionesVariantDemos: GalleryVariantDemoMap = {
  button: {
    variant: [
      { label: "default", node: <Button>Guardar</Button> },
      {
        label: "outline",
        node: (
          <Button variant="outline">
            <PencilIcon />
            Editar
          </Button>
        ),
      },
      {
        label: "secondary",
        node: (
          <Button variant="secondary">
            <PlusIcon />
            Agregar
          </Button>
        ),
      },
      {
        label: "ghost",
        node: (
          <Button variant="ghost">
            <EllipsisVerticalIcon />
            Más
          </Button>
        ),
      },
      {
        label: "destructive",
        node: (
          <Button variant="destructive">
            <Trash2Icon />
            Eliminar
          </Button>
        ),
      },
      {
        label: "link",
        node: <Button variant="link">Ver detalle</Button>,
      },
    ],
    size: [
      {
        label: "xs",
        node: (
          <Button size="xs">
            <PlusIcon />
            Extra pequeño
          </Button>
        ),
      },
      {
        label: "sm",
        node: (
          <Button size="sm">
            <PlusIcon />
            Pequeño
          </Button>
        ),
      },
      {
        label: "default",
        node: (
          <Button>
            <PlusIcon />
            Mediano
          </Button>
        ),
      },
      {
        label: "lg",
        node: (
          <Button size="lg">
            <PlusIcon />
            Grande
          </Button>
        ),
      },
      {
        label: "icon",
        node: (
          <Button size="icon" aria-label="Más acciones">
            <EllipsisVerticalIcon />
          </Button>
        ),
      },
      {
        label: "icon-xs",
        node: (
          <Button size="icon-xs" aria-label="Más acciones">
            <EllipsisVerticalIcon />
          </Button>
        ),
      },
      {
        label: "icon-sm",
        node: (
          <Button size="icon-sm" aria-label="Editar">
            <PencilIcon />
          </Button>
        ),
      },
      {
        label: "icon-lg",
        node: (
          <Button size="icon-lg" variant="destructive" aria-label="Eliminar">
            <Trash2Icon />
          </Button>
        ),
      },
    ],
    states: [
      { label: "normal", node: <Button>Guardar</Button> },
      {
        label: "pending",
        node: (
          <Button disabled>
            <Spinner />
            Guardando
          </Button>
        ),
      },
      {
        label: "disabled",
        node: (
          <Button variant="outline" disabled>
            <SaveIcon />
            Deshabilitado
          </Button>
        ),
      },
    ],
  },
  "button-group": {
    orientation: [
      {
        label: "horizontal",
        node: (
          <ButtonGroup>
            <Button variant="outline">
              <PencilIcon />
              Editar
            </Button>
            <Button variant="outline" aria-label="Más acciones">
              <EllipsisVerticalIcon />
            </Button>
          </ButtonGroup>
        ),
      },
      {
        label: "vertical",
        node: (
          <ButtonGroup orientation="vertical">
            <Button variant="outline">
              <ArrowUpRightIcon />
              Subir
            </Button>
            <Button variant="outline">
              <ArrowDownLeftIcon />
              Bajar
            </Button>
          </ButtonGroup>
        ),
      },
    ],
  },
  toggle: {
    variant: [
      {
        label: "default",
        node: (
          <Toggle aria-label="Favorito">
            <SaveIcon />
          </Toggle>
        ),
      },
      {
        label: "outline",
        node: (
          <Toggle variant="outline" aria-label="Favorito">
            <SaveIcon />
          </Toggle>
        ),
      },
    ],
    size: [
      {
        label: "sm",
        node: (
          <Toggle size="sm" aria-label="Favorito pequeño">
            <SaveIcon />
          </Toggle>
        ),
      },
      {
        label: "default",
        node: (
          <Toggle aria-label="Favorito">
            <SaveIcon />
          </Toggle>
        ),
      },
      {
        label: "lg",
        node: (
          <Toggle size="lg" aria-label="Favorito grande">
            <SaveIcon />
          </Toggle>
        ),
      },
    ],
    states: [
      {
        label: "pressed",
        node: (
          <Toggle defaultPressed aria-label="Favorito activo">
            <SaveIcon />
          </Toggle>
        ),
      },
      {
        label: "unpressed",
        node: (
          <Toggle aria-label="Añadir a favoritos">
            <SaveIcon />
          </Toggle>
        ),
      },
      {
        label: "disabled",
        node: (
          <Toggle disabled aria-label="Favorito deshabilitado">
            <SaveIcon />
          </Toggle>
        ),
      },
    ],
  },
  "toggle-group": {
    multiple: [
      {
        label: "false (exclusivo)",
        node: (
          <ToggleGroup
            defaultValue={["expense"]}
            aria-label="Tipo de movimiento"
          >
            <ToggleGroupItem value="expense" aria-label="Gasto">
              <ArrowDownLeftIcon />
              Gasto
            </ToggleGroupItem>
            <ToggleGroupItem value="income" aria-label="Ingreso">
              <ArrowUpRightIcon />
              Ingreso
            </ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "true",
        node: (
          <ToggleGroup
            multiple
            defaultValue={["saving", "fixed"]}
            aria-label="Etiquetas"
          >
            <ToggleGroupItem value="saving">Ahorro</ToggleGroupItem>
            <ToggleGroupItem value="fixed">Fijo</ToggleGroupItem>
            <ToggleGroupItem value="variable">Variable</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
    variant: [
      {
        label: "default",
        node: (
          <ToggleGroup defaultValue={["one"]} aria-label="Rango">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "outline",
        node: (
          <ToggleGroup
            variant="outline"
            defaultValue={["one"]}
            aria-label="Rango"
          >
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
    size: [
      {
        label: "sm",
        node: (
          <ToggleGroup size="sm" aria-label="Rango pequeño">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "default",
        node: (
          <ToggleGroup aria-label="Rango">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "lg",
        node: (
          <ToggleGroup size="lg" aria-label="Rango grande">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
    states: [
      {
        label: "pressed",
        node: (
          <ToggleGroup defaultValue={["one"]} aria-label="Rango pulsado">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "unpressed",
        node: (
          <ToggleGroup aria-label="Rango sin pulsar">
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
      {
        label: "disabled",
        node: (
          <ToggleGroup
            disabled
            defaultValue={["one"]}
            aria-label="Deshabilitado"
          >
            <ToggleGroupItem value="one">Uno</ToggleGroupItem>
            <ToggleGroupItem value="two">Dos</ToggleGroupItem>
          </ToggleGroup>
        ),
      },
    ],
  },
  "segmented-control": {
    size: [
      {
        label: "sm",
        node: (
          <SegmentedControl<Flow>
            value="expense"
            onChange={() => {}}
            size="sm"
            options={FLOW_SEGMENTS}
          />
        ),
      },
      {
        label: "lg",
        node: (
          <SegmentedControl<Flow>
            value="expense"
            onChange={() => {}}
            size="lg"
            options={FLOW_SEGMENTS}
          />
        ),
      },
    ],
    orientation: [
      {
        label: "horizontal",
        node: (
          <SegmentedControl<Flow>
            value="expense"
            onChange={() => {}}
            options={FLOW_SEGMENTS}
          />
        ),
      },
      {
        label: "vertical",
        node: (
          <SegmentedControl<Flow>
            value="expense"
            onChange={() => {}}
            orientation="vertical"
            options={FLOW_SEGMENTS}
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <SegmentedControl<string>
            value=""
            onChange={() => {}}
            ariaLabel="Tipo de movimiento"
            options={FLOW_SEGMENTS}
          />
        ),
      },
      {
        label: "selected",
        node: (
          <SegmentedControl<Flow>
            value="income"
            onChange={() => {}}
            ariaLabel="Tipo de movimiento"
            options={FLOW_SEGMENTS}
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <SegmentedControl<Flow>
            value="expense"
            onChange={() => {}}
            disabled
            ariaLabel="Tipo de movimiento"
            options={FLOW_SEGMENTS}
          />
        ),
      },
      {
        label: "invalid",
        node: (
          <SegmentedControl<string>
            value=""
            onChange={() => {}}
            ariaLabel="Tipo de movimiento"
            error="Elige gasto o ingreso"
            options={FLOW_SEGMENTS}
          />
        ),
      },
    ],
  },
  "pending-surface": {
    states: [
      {
        label: "idle",
        node: (
          <div className="relative overflow-hidden rounded-lg">
            <Button variant="outline">
              <ChevronRightIcon />
              Abrir detalle
            </Button>
          </div>
        ),
      },
      {
        label: "pending",
        node: (
          <div className="relative overflow-hidden rounded-lg">
            <Button variant="outline">
              <ChevronRightIcon />
              Abrir detalle
            </Button>
            <PendingSurface />
          </div>
        ),
      },
    ],
  },
}
