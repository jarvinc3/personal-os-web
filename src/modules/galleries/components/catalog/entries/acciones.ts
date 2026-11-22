import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const accionesDocs: readonly GalleryComponentMeta[] = [
  {
    id: "button",
    name: "Button",
    category: "acciones",
    kind: "ui",
    description:
      "Botón de acción con variantes de color, tamaños y estados. Siempre lleva icono.",
    whenToUse:
      "Cualquier acción. El texto es opcional; un botón solo-icono lleva aria-label.",
    whenNotToUse:
      "Para navegar: es un Link con buttonVariants, no un botón con router.push.",
    importPath: "@/src/shared/components/ui/button",
    snippet: `import { Button } from "@/src/shared/components/ui/button"
import { SaveIcon } from "lucide-react"

<Button>
  <SaveIcon />
  Guardar
</Button>`,
    subcomponents: [],
    anatomy: "<Button variant size><Icon />Texto</Button>",
    variants: [
      {
        name: "variant",
        values: "default, outline, secondary, ghost, destructive, link",
      },
      { name: "size", values: "sm, default, lg, icon, icon-sm, icon-lg" },
      { name: "states", values: "normal, hover, focus, pending, disabled" },
    ],
    props: [
      {
        name: "variant",
        type: "buttonVariants",
        description: "Color y peso visual de la acción.",
      },
      {
        name: "size",
        type: "buttonVariants",
        description: "Altura y ancho del botón.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea el botón; el pending se compone con Spinner.",
      },
    ],
  },
  {
    id: "button-group",
    name: "ButtonGroup",
    category: "acciones",
    kind: "ui",
    description:
      "Botones o controles unidos como una sola pieza, con separadores opcionales.",
    whenToUse: "Acciones relacionadas que se leen como un bloque compacto.",
    whenNotToUse: "Acciones sin relación: botones sueltos con gap.",
    importPath: "@/src/shared/components/ui/button-group",
    snippet: `import { ButtonGroup } from "@/src/shared/components/ui/button-group"

<ButtonGroup>
  <Button variant="outline">Editar</Button>
  <Button variant="outline">Más</Button>
</ButtonGroup>`,
    subcomponents: ["ButtonGroupText", "ButtonGroupSeparator"],
    anatomy: "<ButtonGroup><Button /><Button /></ButtonGroup>",
    variants: [{ name: "orientation", values: "horizontal, vertical" }],
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "Dirección del grupo.",
      },
    ],
  },
  {
    id: "toggle",
    name: "Toggle",
    category: "acciones",
    kind: "ui",
    description:
      "Botón que mantiene un estado pulsado, con color primario al activarse.",
    whenToUse: "Un control de dos estados que se pulsa y se queda activo.",
    whenNotToUse:
      "Varias opciones exclusivas: ToggleGroup. Un ajuste con efecto: Switch.",
    importPath: "@/src/shared/components/ui/toggle",
    snippet: `import { Toggle } from "@/src/shared/components/ui/toggle"

<Toggle defaultPressed aria-label="Favorito">
  <SaveIcon />
</Toggle>`,
    subcomponents: ["toggleVariants"],
    anatomy: "<Toggle variant size pressed onPressedChange />",
    variants: [
      { name: "variant", values: "default, outline" },
      { name: "size", values: "sm, default, lg" },
      { name: "states", values: "pressed, unpressed, disabled" },
    ],
    props: [
      {
        name: "pressed / defaultPressed",
        type: "boolean",
        description: "Estado pulsado controlado o inicial.",
      },
      {
        name: "onPressedChange",
        type: "(pressed: boolean) => void",
        description: "Cambio del estado.",
      },
      {
        name: "variant / size",
        type: "toggleVariants",
        description: "Aspecto y tamaño.",
      },
    ],
  },
  {
    id: "toggle-group",
    name: "ToggleGroup",
    category: "acciones",
    kind: "ui",
    description:
      "Grupo de toggles con selección exclusiva o múltiple; el activo lleva el color primario.",
    whenToUse:
      "Un filtro de dos a cinco opciones dentro de un formulario o una vista.",
    whenNotToUse: "Navegación con paneles: Tabs. Un catálogo largo: su hoja.",
    importPath: "@/src/shared/components/ui/toggle-group",
    snippet: `import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/shared/components/ui/toggle-group"

<ToggleGroup defaultValue={["expense"]}>
  <ToggleGroupItem value="expense">Gasto</ToggleGroupItem>
  <ToggleGroupItem value="income">Ingreso</ToggleGroupItem>
</ToggleGroup>`,
    subcomponents: ["ToggleGroupItem"],
    anatomy: "<ToggleGroup><ToggleGroupItem /></ToggleGroup>",
    variants: [
      { name: "multiple", values: "false (exclusivo), true" },
      { name: "variant", values: "default, outline" },
      { name: "size", values: "sm, default, lg" },
      { name: "states", values: "pressed, unpressed, disabled" },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string[]",
        description: "Valores pulsados.",
      },
      {
        name: "onValueChange",
        type: "(value: string[]) => void",
        description: "Cambio de la selección.",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "Permite más de un ítem pulsado.",
      },
    ],
  },
  {
    id: "segmented-control",
    name: "SegmentedControl",
    category: "acciones",
    kind: "domain",
    description:
      "Píldoras de elección exclusiva con icono y estado primario, sobre ToggleGroup.",
    whenToUse:
      "Un filtro corto dentro de un formulario o una pantalla, con dos a cinco opciones.",
    whenNotToUse:
      "Navegación con paneles: Tabs. La Ola 1 lo reemplaza por ToggleGroup directo.",
    importPath: "@/src/shared/components/forms/segmented-control",
    snippet: `import { SegmentedControl } from "@/src/shared/components/forms/segmented-control"

<SegmentedControl value={value} onChange={setValue} options={options} />`,
    subcomponents: [],
    anatomy: "<SegmentedControl value onChange options size fullWidth />",
    variants: [
      { name: "size", values: "sm, lg" },
      { name: "orientation", values: "horizontal, vertical" },
      { name: "states", values: "normal, selected, disabled, invalid" },
    ],
    props: [
      {
        name: "options",
        type: "{ value, label, icon? }[]",
        description: "Segmentos disponibles.",
      },
      {
        name: "value / onChange",
        type: "T / (value: T) => void",
        description: "Opción elegida.",
      },
      {
        name: "size",
        type: '"sm" | "lg"',
        description: "Altura de las píldoras.",
      },
      {
        name: "fullWidth",
        type: "boolean",
        description: "Reparte los segmentos en todo el ancho.",
      },
    ],
  },
  {
    id: "pending-surface",
    name: "PendingSurface",
    category: "acciones",
    kind: "domain",
    description:
      "Superficie con opacidad y spinner que marca una navegación pendiente.",
    whenToUse:
      "Dentro de un Link o un control que abre otra vista; LinkPendingOverlay ya la monta.",
    whenNotToUse:
      "Para el pending de una mutación: el Spinner dentro del botón que guarda.",
    importPath: "@/src/shared/components/shell/navigation-pending",
    snippet: `import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"

<Link href={href} className="relative">
  …
  <LinkPendingOverlay />
</Link>`,
    subcomponents: ["LinkPendingOverlay"],
    anatomy: "<LinkPendingOverlay />",
    variants: [{ name: "states", values: "idle, pending" }],
    props: [
      {
        name: "className",
        type: "string",
        description: "Ajuste de la superficie sobre el control.",
      },
    ],
  },
]
