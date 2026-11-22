import { useState } from "react"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  MoonIcon,
  PaletteIcon,
  SlidersHorizontalIcon,
  SunIcon,
} from "lucide-react"

import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { DayListField } from "@/src/shared/components/forms/day-list-field"
import { OptionRow } from "@/src/shared/components/forms/option-row"
import { SelectField } from "@/src/shared/components/forms/select-field"
import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import {
  GALLERY_ACCENT,
  GALLERY_TIME,
} from "@/src/modules/galleries/components/mock/values"

import type { GalleryDemoMap } from "@/src/modules/galleries/components/catalog/types"

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

const DENSITIES = [
  { value: "comoda", label: "Cómoda" },
  { value: "compacta", label: "Compacta" },
]

function OptionRowDemo() {
  const [theme, setTheme] = useState("claro")

  return (
    <div className="flex w-full flex-col gap-3">
      <OptionRow
        label="Tema claro"
        description="Siempre claro"
        icon={SunIcon}
        iconColor={GALLERY_ACCENT}
        accentColor={GALLERY_ACCENT}
        selected={theme === "claro"}
        onPress={() => setTheme("claro")}
      />
      <OptionRow
        label="Tema oscuro"
        description="Sigue al sistema"
        icon={MoonIcon}
        iconColor={GALLERY_ACCENT}
        accentColor={GALLERY_ACCENT}
        selected={theme === "oscuro"}
        onPress={() => setTheme("oscuro")}
      />
    </div>
  )
}

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

function SelectFieldDemo() {
  const [density, setDensity] = useState("comoda")

  return (
    <div className="flex w-full flex-col gap-3">
      <SelectField
        label="Densidad"
        value={density}
        onChange={setDensity}
        icon={SlidersHorizontalIcon}
        options={DENSITIES}
      />
      <SelectField
        label="Densidad"
        value=""
        onChange={() => {}}
        icon={SlidersHorizontalIcon}
        options={DENSITIES}
        error="Elige una densidad"
      />
      <SelectField
        label="Densidad fija"
        value="comoda"
        onChange={() => {}}
        icon={SlidersHorizontalIcon}
        options={DENSITIES}
        disabled
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
  "option-row": [
    {
      label: "Normal y seleccionada",
      code: `
const [theme, setTheme] = useState("claro")

<div className="flex w-full flex-col gap-3">
  <OptionRow
    label="Tema claro"
    description="Siempre claro"
    icon={SunIcon}
    iconColor="#0f766e"
    accentColor="#0f766e"
    selected={theme === "claro"}
    onPress={() => setTheme("claro")}
  />
  <OptionRow
    label="Tema oscuro"
    description="Sigue al sistema"
    icon={MoonIcon}
    iconColor="#0f766e"
    accentColor="#0f766e"
    selected={theme === "oscuro"}
    onPress={() => setTheme("oscuro")}
  />
</div>
`,
      node: <OptionRowDemo />,
    },
  ],
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
  "select-field": [
    {
      label: "Normal, con error y deshabilitado",
      code: `
const [density, setDensity] = useState("comoda")

const DENSITIES = [
  { value: "comoda", label: "Cómoda" },
  { value: "compacta", label: "Compacta" },
]

<div className="flex w-full flex-col gap-3">
  <SelectField
    label="Densidad"
    value={density}
    onChange={setDensity}
    icon={SlidersHorizontalIcon}
    options={DENSITIES}
  />
  <SelectField
    label="Densidad"
    value=""
    onChange={() => {}}
    icon={SlidersHorizontalIcon}
    options={DENSITIES}
    error="Elige una densidad"
  />
  <SelectField
    label="Densidad fija"
    value="comoda"
    onChange={() => {}}
    icon={SlidersHorizontalIcon}
    options={DENSITIES}
    disabled
  />
</div>
`,
      node: <SelectFieldDemo />,
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
