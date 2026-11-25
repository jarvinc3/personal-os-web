import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const selectoresDocs: readonly GalleryComponentMeta[] = [
  {
    id: "choice-grid",
    name: "ChoiceGrid",
    category: "selectores",
    kind: "domain",
    description:
      "Celdas de elección exclusiva para pocas opciones, con icono o media y check al elegir.",
    whenToUse:
      "Un tipo de movimiento, un avatar o un filtro de dos a cinco opciones.",
    whenNotToUse:
      "Opciones con descripción o un catálogo largo: filas de elección con `FieldLabel` y `RadioGroupItem` en su hoja.",
    importPath: "@/src/shared/components/forms/choice-grid",
    snippet: `import { ChoiceGrid } from "@/src/shared/components/forms/choice-grid"

<ChoiceGrid
  value={kind}
  onValueChange={setKind}
  options={options}
  ariaLabel="Tipo de movimiento"
  accentColor={accent}
/>`,
    subcomponents: [],
    anatomy: [{ name: "ChoiceGrid" }],
    variants: [
      { name: "columns", values: "2, 3, 4" },
      { name: "media", values: "icono por opción o una media propia" },
      { name: "states", values: "normal, selected, disabled" },
    ],
    props: [
      {
        name: "value / onValueChange",
        type: "T / (value: T) => void",
        description: "Opción elegida y su cambio.",
      },
      {
        name: "options",
        type: "{ value, label, icon?, media? }[]",
        description: "Celdas disponibles.",
      },
      {
        name: "accentColor",
        type: "string",
        description: "Color del módulo en el borde y el icono elegido.",
      },
    ],
  },
  {
    id: "color-picker-swatch",
    name: "ColorPickerSwatch",
    category: "selectores",
    kind: "domain",
    description:
      "Muestra que abre el selector de color de una categoría o meta.",
    whenToUse: "El color de una categoría, una meta o una etiqueta.",
    whenNotToUse: "El color de una entidad financiera, que viene de su marca.",
    importPath: "@/src/shared/components/forms/color-picker",
    snippet: `import { ColorPickerSwatch } from "@/src/shared/components/forms/color-picker"

<ColorPickerSwatch id="category-color" variant="circle" value={color} onChange={setColor} />`,
    subcomponents: [],
    anatomy: [{ name: "ColorPickerSwatch" }],
    variants: [
      { name: "variant", values: "circle, square" },
      { name: "states", values: "normal, selected, disabled" },
    ],
    props: [
      {
        name: "value / onChange",
        type: "string / (color: string) => void",
        description: "Color elegido, en hex.",
      },
      {
        name: "variant",
        type: '"circle" | "square"',
        description: "Forma del muestra.",
      },
      {
        name: "defaultColor",
        type: "string",
        description: "Color inicial cuando el control no es controlado.",
      },
    ],
  },
  {
    id: "wheel-field",
    name: "WheelField",
    category: "selectores",
    kind: "domain",
    description:
      "Fila que abre una rueda a ancho completo y cierra con Listo. Es el único contenedor válido de una rueda.",
    whenToUse:
      "Cualquier fecha, hora o duración. Contiene FinanceDateField, TimePairWheels o DurationWheels.",
    whenNotToUse:
      "Una rueda suelta en la pantalla. Tampoco para un catálogo de texto.",
    importPath: "@/src/shared/components/forms/wheel-field",
    snippet: `import { WheelField } from "@/src/shared/components/forms/wheel-field"
import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"

<WheelField label="Hora" valueLabel="9:30" icon={ClockIcon}>
  <TimePairWheels value={time} minuteStep={5} onChange={setTime} />
</WheelField>`,
    subcomponents: [],
    anatomy: [
      {
        name: "WheelField",
        children: [
          { name: "DateWheels" },
          { name: "TimePairWheels" },
          { name: "DurationWheels" },
        ],
      },
    ],
    variants: [
      { name: "valueLabel", values: "texto de la fila cerrada" },
      { name: "aside", values: "control junto al disparador" },
    ],
    props: [
      {
        name: "label",
        type: "string",
        description: "Etiqueta de la fila.",
      },
      {
        name: "valueLabel",
        type: "string",
        description: "Valor visible mientras la rueda está cerrada.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono líder del tipo de dato.",
      },
    ],
  },
  {
    id: "time-pair-wheels",
    name: "TimePairWheels",
    category: "selectores",
    kind: "domain",
    description:
      "Rueda de hora de reloj HH:mm 24 h con minutos configurables. Solo vive dentro de WheelField.",
    whenToUse: "Una hora del día dentro de WheelField.",
    whenNotToUse:
      "Una duración: DurationWheels. Suelta en una pantalla: nunca.",
    importPath: "@/src/shared/components/forms/wheel-picker",
    snippet: `import { TimePairWheels } from "@/src/shared/components/forms/wheel-picker"

<TimePairWheels value="09:30" minuteStep={5} onChange={setTime} />`,
    subcomponents: [],
    anatomy: [{ name: "TimePairWheels" }],
    variants: [
      { name: "minuteStep", values: "1, 5, 10" },
      { name: "value", values: "HH:mm en 24 h" },
    ],
    props: [
      {
        name: "value / onChange",
        type: "string / (value: string) => void",
        description: "Hora en HH:mm de 24 horas.",
      },
      {
        name: "minuteStep",
        type: "1 | 5 | 10",
        description: "Salto entre minutos.",
      },
    ],
  },
  {
    id: "day-list-field",
    name: "DayListField",
    category: "selectores",
    kind: "domain",
    description:
      "Lista de días del mes: cada día abre su rueda y la lista suma o quita días.",
    whenToUse:
      "Los días de pago de un ingreso fijo o de un gasto que cae en varios días.",
    whenNotToUse:
      "Un solo día: FinanceDateField. Una fecha concreta: WheelField con DateWheels.",
    importPath: "@/src/shared/components/forms/day-list-field",
    snippet: `import { DayListField } from "@/src/shared/components/forms/day-list-field"

<DayListField
  label="Días de pago"
  icon={CalendarDaysIcon}
  value={days}
  onChange={setDays}
/>`,
    subcomponents: [],
    anatomy: [{ name: "DayListField" }],
    variants: [
      {
        name: "states",
        values: "un día, varios días, sin días libres, invalid, disabled",
      },
      { name: "min / max", values: "rango de días permitido" },
    ],
    props: [
      {
        name: "value / onChange",
        type: "string / (value: string) => void",
        description: "Días separados por coma o espacio.",
      },
      {
        name: "label",
        type: "string",
        description: "Etiqueta del campo.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono líder; por defecto, el de calendario.",
      },
      {
        name: "error",
        type: "string",
        description: "Error bajo la lista de días.",
      },
    ],
  },
]
