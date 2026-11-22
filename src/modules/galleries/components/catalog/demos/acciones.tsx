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

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

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
