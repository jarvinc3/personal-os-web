import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const selectoresDocs: readonly GalleryComponentMeta[] = [
  {
    id: "option-row",
    name: "OptionRow",
    category: "selectores",
    kind: "domain",
    description:
      "Fila de una opción con icono, título, descripción y borde de acento al elegir.",
    whenToUse:
      "Una lista corta de opciones con descripción dentro de una hoja de selección.",
    whenNotToUse:
      "Una elección de dos a cinco sin descripción: ChoiceGrid. Un catálogo largo: filas de búsqueda en su hoja.",
    importPath: "@/src/shared/components/forms/option-row",
    snippet: `import { OptionRow } from "@/src/shared/components/forms/option-row"

<OptionRow
  label="Tema claro"
  description="Siempre claro"
  icon={SunIcon}
  accentColor={accent}
  selected={selected}
  onPress={onPress}
/>`,
    subcomponents: [],
    anatomy: "<OptionRow icon label description selected onPress />",
    variants: [
      {
        name: "states",
        values: "normal, selected, hover, disabled por el padre",
      },
      { name: "accentColor", values: "color del módulo en el borde elegido" },
    ],
    props: [
      {
        name: "selected",
        type: "boolean",
        description: "Marca la opción con el borde de acento.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono de la opción.",
      },
      {
        name: "trailing",
        type: "ReactNode",
        description: "Contenido a la derecha, como un check.",
      },
    ],
  },
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
      "Opciones con descripción o un catálogo largo: OptionRow en su hoja.",
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
    anatomy: "<ChoiceGrid value onValueChange options accentColor columns />",
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
    id: "select-field",
    name: "SelectField",
    category: "selectores",
    kind: "domain",
    description:
      "Select con etiqueta, icono líder y error, listo para un formulario.",
    whenToUse: "Un catálogo corto dentro de un formulario.",
    whenNotToUse:
      "Un catálogo largo: hoja de selección. Una elección con descripción: OptionRow.",
    importPath: "@/src/shared/components/forms/select-field",
    snippet: `import { SelectField } from "@/src/shared/components/forms/select-field"

<SelectField
  label="Densidad"
  value={density}
  onChange={setDensity}
  icon={SlidersHorizontalIcon}
  options={options}
/>`,
    subcomponents: [],
    anatomy: "<SelectField label value onChange icon options error />",
    variants: [
      { name: "states", values: "normal, invalid, disabled" },
      { name: "mark", values: "ReactNode opcional junto a cada opción" },
    ],
    props: [
      {
        name: "options",
        type: "{ value, label, mark? }[]",
        description: "Opciones del catálogo.",
      },
      {
        name: "error",
        type: "string",
        description: "Error bajo el select.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono líder del dato.",
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
    anatomy: "<ColorPickerSwatch id variant value onChange disabled />",
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
    anatomy: "<WheelField label valueLabel icon aside><Wheels /></WheelField>",
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
    anatomy: "<TimePairWheels value minuteStep onChange />",
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
]
