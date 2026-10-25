"use client"

import { GalleryDemo } from "@/src/modules/galleries/components/gallery-demo"
import {
  GALLERY_ACCENT,
  GALLERY_TIME,
} from "@/src/modules/galleries/components/mock/values"
import { OptionRow } from "@/src/shared/components/forms/option-row"
import { SelectField } from "@/src/shared/components/forms/select-field"
import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"
import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"
import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  LandmarkIcon,
  PaletteIcon,
  TagIcon,
} from "lucide-react"
import { useState } from "react"

type MovementKind = "expense" | "income" | "transfer"

const MOVEMENT_KINDS = [
  { value: "expense", label: "Gasto", icon: ArrowDownLeftIcon },
  { value: "income", label: "Ingreso", icon: ArrowUpRightIcon },
  { value: "transfer", label: "Transferencia", icon: ArrowLeftRightIcon },
] as const

/** Filas de opción, celdas de elección, catálogo, color y rueda (#307). */
export function SelectorsSection() {
  const [kind, setKind] = useState<MovementKind>("expense")
  const [account, setAccount] = useState("ahorros")
  const [institution, setInstitution] = useState("banco-ejemplo")
  const [color, setColor] = useState("#0f766e")
  const [time, setTime] = useState(GALLERY_TIME)

  return (
    <>
      <GalleryDemo
        name="OptionRow"
        importPath="@/src/shared/components/forms/option-row"
        states="normal, seleccionada"
        note="Una opción con descripción. La seleccionada lleva el borde del color del módulo."
      >
        <OptionRow
          label="Cuenta de ahorros"
          description="Banco Ejemplo · DOP $12,500.00"
          icon={LandmarkIcon}
          iconColor={GALLERY_ACCENT}
          accentColor={GALLERY_ACCENT}
          selected={account === "ahorros"}
          onPress={() => setAccount("ahorros")}
        />
        <OptionRow
          label="Cuenta corriente"
          description="Banco Ejemplo · DOP $3,200.00"
          icon={LandmarkIcon}
          iconColor={GALLERY_ACCENT}
          accentColor={GALLERY_ACCENT}
          selected={account === "corriente"}
          onPress={() => setAccount("corriente")}
        />
      </GalleryDemo>

      <GalleryDemo
        name="ChoiceGrid"
        importPath="@/src/shared/components/forms/choice-grid"
        states="tres opciones, una elegida"
        note="Elección exclusiva de dos a cinco opciones cuyo nombre basta."
      >
        <ChoiceGrid
          value={kind}
          onValueChange={setKind}
          options={MOVEMENT_KINDS}
          ariaLabel="Tipo de movimiento"
          accentColor={GALLERY_ACCENT}
        />
      </GalleryDemo>

      <GalleryDemo
        name="SelectField"
        importPath="@/src/shared/components/forms/select-field"
        states="normal, con error, deshabilitado"
        note="Catálogo corto en un select. Un catálogo largo se elige en una hoja."
      >
        <SelectField
          label="Institución"
          value={institution}
          onChange={setInstitution}
          icon={LandmarkIcon}
          options={[
            { value: "banco-ejemplo", label: "Banco Ejemplo" },
            { value: "efectivo", label: "Efectivo" },
          ]}
        />
        <SelectField
          label="Categoría"
          value=""
          onChange={() => {}}
          icon={TagIcon}
          options={[{ value: "mercado", label: "Mercado" }]}
          error="Elige una categoría"
        />
        <SelectField
          label="Institución fija"
          value="banco-ejemplo"
          onChange={() => {}}
          icon={LandmarkIcon}
          options={[{ value: "banco-ejemplo", label: "Banco Ejemplo" }]}
          disabled
        />
      </GalleryDemo>

      <GalleryDemo
        name="ColorPickerSwatch"
        importPath="@/src/shared/components/forms/color-picker"
        states="círculo, cuadrado, entrada, deshabilitado"
        note="El color de una categoría o una meta se elige con este control."
      >
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
      </GalleryDemo>

      <GalleryDemo
        name="WheelField + TimePairWheels"
        importPath="@/src/shared/components/forms/wheel-field"
        states="Hora · HH:mm 24 h"
        note="La rueda nunca va suelta: siempre dentro de WheelField, que abre el panel a ancho completo y lo cierra con Listo."
      >
        <WheelField label="Hora" valueLabel={time} icon={ClockIcon}>
          <TimePairWheels value={time} minuteStep={5} onChange={setTime} />
        </WheelField>
      </GalleryDemo>
    </>
  )
}
