import { useState } from "react"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  PaletteIcon,
} from "lucide-react"

import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { DayListField } from "@/src/shared/components/forms/day-list-field"
import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { Button } from "@/src/shared/components/ui/button"
import {
  GALLERY_ACCENT,
  GALLERY_TIME,
} from "@/src/modules/galleries/components/mock/values"

import type {
  GalleryDemoMap,
  GalleryVariantDemoMap,
} from "@/src/modules/galleries/components/catalog/types"

type MovementKind = "expense" | "income" | "transfer"

const AVATAR_SWATCHES = Array.from({ length: 8 }, (_, index) => ({
  value: `avatar-${index}`,
  label: `Avatar ${index + 1}`,
  color: ["#0f766e", "#b45309", "#7c3aed", "#be123c"][index % 4],
}))

const MOVEMENT_KINDS = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
  { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
  { value: "transfer", label: "Transferencia", icon: ArrowLeftRightIcon },
] as const

function ChoiceGridDemo() {
  const [kind, setKind] = useState<MovementKind>("expense")
  const [avatar, setAvatar] = useState(AVATAR_SWATCHES[0].value)

  return (
    <div className="flex w-full flex-col gap-4">
      <ChoiceGrid
        value={kind}
        onValueChange={setKind}
        options={MOVEMENT_KINDS}
        ariaLabel="Tipo de movimiento"
        accentColor={GALLERY_ACCENT}
      />
      <ChoiceGrid
        value={avatar}
        onValueChange={setAvatar}
        ariaLabel="Avatar"
        accentColor={GALLERY_ACCENT}
        columns={4}
        options={AVATAR_SWATCHES.map((swatch) => ({
          value: swatch.value,
          label: swatch.label,
          media: (
            <span
              className="flex size-full items-center justify-center text-xs font-semibold text-white"
              style={{ backgroundColor: swatch.color }}
            >
              {swatch.label.slice(0, 2)}
            </span>
          ),
        }))}
      />
    </div>
  )
}

function ColorPickerDemo() {
  const [color, setColor] = useState("#0f766e")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ColorPickerSwatch
        id="galeria-color-circulo"
        variant="circle"
        value={color}
        onChange={setColor}
      />
      <ColorPickerSwatch
        id="galeria-color-cuadrado"
        variant="square"
        defaultColor="#9333ea"
      />
      <ColorPickerSwatch
        id="galeria-color-deshabilitado"
        variant="circle"
        defaultColor="#64748b"
        disabled
      />
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <PaletteIcon className="size-3.5" aria-hidden />
        {color}
      </span>
    </div>
  )
}

function WheelFieldDemo() {
  const [time, setTime] = useState(GALLERY_TIME)

  return (
    <WheelField label="Hora" valueLabel={time} icon={ClockIcon}>
      <TimePairWheels value={time} minuteStep={5} onChange={setTime} />
    </WheelField>
  )
}

function DayListFieldDemo() {
  const [days, setDays] = useState("1, 15")

  return (
    <DayListField
      label="Días de pago"
      icon={CalendarDaysIcon}
      value={days}
      onChange={setDays}
    />
  )
}

export const selectoresDemos: GalleryDemoMap = {
  "choice-grid": [
    {
      label: "Tres opciones con icono y celdas con media",
      code: `
const [kind, setKind] = useState("expense")
const [avatar, setAvatar] = useState("avatar-1")

const MOVEMENT_KINDS = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
  { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
  { value: "transfer", label: "Transferencia", icon: ArrowLeftRightIcon },
]

<div className="flex w-full flex-col gap-4">
  <ChoiceGrid
    value={kind}
    onValueChange={setKind}
    options={MOVEMENT_KINDS}
    ariaLabel="Tipo de movimiento"
    accentColor="#0f766e"
  />
  <ChoiceGrid
    value={avatar}
    onValueChange={setAvatar}
    ariaLabel="Avatar"
    accentColor="#0f766e"
    columns={4}
    options={AVATAR_SWATCHES.map((swatch) => ({
      value: swatch.value,
      label: swatch.label,
      media: (
        <span
          className="flex size-full items-center justify-center text-xs font-semibold text-white"
          style={{ backgroundColor: swatch.color }}
        >
          {swatch.label.slice(0, 2)}
        </span>
      ),
    }))}
  />
</div>
`,
      node: <ChoiceGridDemo />,
    },
  ],
  "color-picker-swatch": [
    {
      label: "Círculo, cuadrado, entrada y deshabilitado",
      code: `
const [color, setColor] = useState("#0f766e")

<div className="flex flex-wrap items-center gap-3">
  <ColorPickerSwatch
    id="galeria-color-circulo"
    variant="circle"
    value={color}
    onChange={setColor}
  />
  <ColorPickerSwatch
    id="galeria-color-cuadrado"
    variant="square"
    defaultColor="#9333ea"
  />
  <ColorPickerSwatch
    id="galeria-color-deshabilitado"
    variant="circle"
    defaultColor="#64748b"
    disabled
  />
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <PaletteIcon className="size-3.5" aria-hidden />
    {color}
  </span>
</div>
`,
      node: <ColorPickerDemo />,
    },
  ],
  "wheel-field": [
    {
      label: "Hora con TimePairWheels",
      code: `
const [time, setTime] = useState("09:30")

<WheelField label="Hora" valueLabel={time} icon={ClockIcon}>
  <TimePairWheels value={time} minuteStep={5} onChange={setTime} />
</WheelField>
`,
      node: <WheelFieldDemo />,
    },
  ],
  "time-pair-wheels": [
    {
      label: "Hora con pasos de 5 minutos",
      code: `
const [time, setTime] = useState("09:30")

<WheelField label="Hora" valueLabel={time} icon={ClockIcon}>
  <TimePairWheels value={time} minuteStep={5} onChange={setTime} />
</WheelField>
`,
      node: <WheelFieldDemo />,
    },
  ],
  "day-list-field": [
    {
      label: "Dos días y el botón para agregar",
      code: `
const [days, setDays] = useState("1, 15")

<DayListField
  label="Días de pago"
  icon={CalendarDaysIcon}
  value={days}
  onChange={setDays}
/>
`,
      node: <DayListFieldDemo />,
    },
  ],
}

export const selectoresVariantDemos: GalleryVariantDemoMap = {
  "choice-grid": {
    columns: [
      {
        label: "2",
        node: (
          <ChoiceGrid
            value="expense"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento en dos columnas"
            accentColor={GALLERY_ACCENT}
            columns={2}
          />
        ),
      },
      {
        label: "3",
        node: (
          <ChoiceGrid
            value="expense"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento en tres columnas"
            accentColor={GALLERY_ACCENT}
            columns={3}
          />
        ),
      },
      {
        label: "4",
        node: (
          <ChoiceGrid
            value="expense"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento en cuatro columnas"
            accentColor={GALLERY_ACCENT}
            columns={4}
          />
        ),
      },
    ],
    media: [
      {
        label: "icono por opción",
        node: (
          <ChoiceGrid
            value="expense"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento"
            accentColor={GALLERY_ACCENT}
          />
        ),
      },
      {
        label: "una media propia",
        node: (
          <ChoiceGrid
            value="avatar-0"
            onValueChange={() => {}}
            ariaLabel="Avatar"
            accentColor={GALLERY_ACCENT}
            columns={4}
            options={AVATAR_SWATCHES.map((swatch) => ({
              value: swatch.value,
              label: swatch.label,
              media: (
                <span
                  className="flex size-full items-center justify-center text-xs font-semibold text-white"
                  style={{ backgroundColor: swatch.color }}
                >
                  {swatch.label.slice(0, 2)}
                </span>
              ),
            }))}
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <ChoiceGrid<string>
            value=""
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento sin elegir"
            accentColor={GALLERY_ACCENT}
          />
        ),
      },
      {
        label: "selected",
        node: (
          <ChoiceGrid
            value="transfer"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento elegido"
            accentColor={GALLERY_ACCENT}
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <ChoiceGrid
            value="expense"
            onValueChange={() => {}}
            options={MOVEMENT_KINDS}
            ariaLabel="Tipo de movimiento deshabilitado"
            accentColor={GALLERY_ACCENT}
            disabled
          />
        ),
      },
    ],
  },
  "color-picker-swatch": {
    variant: [
      {
        label: "circle",
        node: (
          <ColorPickerSwatch
            id="variant-color-circle"
            variant="circle"
            defaultColor={GALLERY_ACCENT}
          />
        ),
      },
      {
        label: "square",
        node: (
          <ColorPickerSwatch
            id="variant-color-square"
            variant="square"
            defaultColor="#9333ea"
          />
        ),
      },
    ],
    states: [
      {
        label: "normal",
        node: (
          <ColorPickerSwatch
            id="variant-color-normal"
            variant="circle"
            defaultColor={GALLERY_ACCENT}
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <ColorPickerSwatch
            id="variant-color-disabled"
            variant="circle"
            defaultColor="#64748b"
            disabled
          />
        ),
      },
    ],
  },
  "wheel-field": {
    valueLabel: [
      {
        label: "texto de la fila cerrada",
        node: (
          <WheelField label="Hora" valueLabel={GALLERY_TIME} icon={ClockIcon}>
            <TimePairWheels
              value={GALLERY_TIME}
              minuteStep={5}
              onChange={() => {}}
            />
          </WheelField>
        ),
      },
    ],
    aside: [
      {
        label: "control junto al disparador",
        node: (
          <WheelField
            label="Hora"
            valueLabel={GALLERY_TIME}
            icon={ClockIcon}
            aside={
              <Button
                size="icon-sm"
                variant="ghost"
                aria-label="Marcar como ahora"
              >
                <ClockIcon />
              </Button>
            }
          >
            <TimePairWheels
              value={GALLERY_TIME}
              minuteStep={5}
              onChange={() => {}}
            />
          </WheelField>
        ),
      },
    ],
  },
  "time-pair-wheels": {
    minuteStep: [
      {
        label: "1",
        node: (
          <TimePairWheels
            value={GALLERY_TIME}
            minuteStep={1}
            onChange={() => {}}
          />
        ),
      },
      {
        label: "5",
        node: (
          <TimePairWheels
            value={GALLERY_TIME}
            minuteStep={5}
            onChange={() => {}}
          />
        ),
      },
      {
        label: "10",
        node: (
          <TimePairWheels
            value={GALLERY_TIME}
            minuteStep={10}
            onChange={() => {}}
          />
        ),
      },
    ],
    value: [
      {
        label: "09:30",
        node: (
          <TimePairWheels value="09:30" minuteStep={5} onChange={() => {}} />
        ),
      },
      {
        label: "21:05",
        node: (
          <TimePairWheels value="21:05" minuteStep={5} onChange={() => {}} />
        ),
      },
    ],
  },
  "day-list-field": {
    states: [
      {
        label: "un día",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value="15"
            onChange={() => {}}
          />
        ),
      },
      {
        label: "varios días",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value="1, 15"
            onChange={() => {}}
          />
        ),
      },
      {
        label: "sin días libres",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value=""
            onChange={() => {}}
          />
        ),
      },
      {
        label: "invalid",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value="32"
            onChange={() => {}}
            error="Elige un día entre 1 y 31"
          />
        ),
      },
      {
        label: "disabled",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value="1, 15"
            onChange={() => {}}
            disabled
          />
        ),
      },
    ],
    "min / max": [
      {
        label: "rango de días permitido",
        node: (
          <DayListField
            label="Días de pago"
            icon={CalendarDaysIcon}
            value="10"
            onChange={() => {}}
            min={1}
            max={15}
          />
        ),
      },
    ],
  },
}
