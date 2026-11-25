import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const entradasDocs: readonly GalleryComponentMeta[] = [
  {
    id: "input",
    name: "Input",
    category: "entradas",
    kind: "ui",
    description: "Campo de texto de una línea.",
    whenToUse:
      "Texto corto dentro de un Field con su etiqueta y, si aplica, su icono líder.",
    whenNotToUse:
      "Fechas u horas: van en rueda. Un monto, en FinanceMoneyField.",
    importPath: "@/src/shared/components/ui/input",
    snippet: `import { Input } from "@/src/shared/components/ui/input"

<Input placeholder="Nombre de la etiqueta" />`,
    subcomponents: [],
    anatomy: [{ name: "Input" }],
    variants: [
      { name: "type", values: "text, email, password, search, number" },
      { name: "states", values: "normal, focus, invalid, disabled" },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "Valor controlado o inicial.",
      },
      {
        name: "onChange",
        type: "(event) => void",
        description: "Cambio del texto.",
      },
      {
        name: "aria-invalid",
        type: "boolean",
        description: "Marca el error; el color lo pone el tema.",
      },
    ],
  },
  {
    id: "textarea",
    name: "Textarea",
    category: "entradas",
    kind: "ui",
    description: "Campo de texto de varias líneas.",
    whenToUse: "Notas, descripciones y motivos que no caben en una línea.",
    whenNotToUse: "Texto corto; usa Input.",
    importPath: "@/src/shared/components/ui/textarea",
    snippet: `import { Textarea } from "@/src/shared/components/ui/textarea"

<Textarea placeholder="Notas del movimiento" rows={3} />`,
    subcomponents: [],
    anatomy: [{ name: "Textarea" }],
    variants: [
      { name: "rows", values: "2, 3, 4" },
      { name: "states", values: "normal, focus, invalid, disabled" },
    ],
    props: [
      {
        name: "rows",
        type: "number",
        description: "Alto inicial en líneas.",
      },
      {
        name: "value / onChange",
        type: "string / (event) => void",
        description: "Valor controlado y su cambio.",
      },
    ],
  },
  {
    id: "label",
    name: "Label",
    category: "entradas",
    kind: "ui",
    description: "Etiqueta accesible asociada a un control por htmlFor.",
    whenToUse:
      "El nombre de un control cuando no hay FieldLabel a mano; FieldLabel ya la usa.",
    whenNotToUse: "Como texto decorativo: no es un párrafo ni un título.",
    importPath: "@/src/shared/components/ui/label",
    snippet: `import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"

<Label htmlFor="name">Comercio</Label>
<Input id="name" />`,
    subcomponents: [],
    anatomy: [{ name: "Label" }],
    variants: [{ name: "states", values: "normal, disabled por el control" }],
    props: [
      {
        name: "htmlFor",
        type: "string",
        description: "Id del control que nombra.",
      },
    ],
  },
  {
    id: "field",
    name: "Field",
    category: "entradas",
    kind: "ui",
    description:
      "Anatomía de un campo: etiqueta arriba, control, descripción y error pegados.",
    whenToUse:
      "Cualquier control con etiqueta, en formularios, ajustes y filtros.",
    whenNotToUse:
      "Una casilla o un radio con su propio label al lado; ahí no aporta.",
    importPath: "@/src/shared/components/ui/field",
    snippet: `import {
  Field,
  FieldError,
  FieldLabel,
} from "@/src/shared/components/ui/field"

<Field className="gap-1">
  <FieldLabel>Destino</FieldLabel>
  <Input />
  <FieldError>{error}</FieldError>
</Field>`,
    subcomponents: [
      "FieldLabel",
      "FieldDescription",
      "FieldError",
      "FieldGroup",
      "FieldSet",
      "FieldLegend",
      "FieldSeparator",
      "FieldContent",
      "FieldTitle",
      "FieldMedia",
    ],
    anatomy: [
      {
        name: "Field",
        children: [
          { name: "FieldLabel" },
          { name: "Input" },
          { name: "FieldDescription" },
          { name: "FieldError" },
        ],
      },
    ],
    variants: [
      { name: "orientation", values: "vertical, horizontal, responsive" },
      { name: "variant", values: "plain, card" },
      { name: "states", values: "normal, invalid, disabled" },
    ],
    props: [
      {
        name: "orientation",
        type: '"vertical" | "horizontal" | "responsive"',
        description: "Etiqueta arriba o al lado del control.",
      },
      {
        name: "variant",
        type: '"plain" | "card"',
        description: "Sin fondo o como tarjeta con borde, relleno y radio.",
      },
      {
        name: "data-invalid",
        type: "boolean",
        description: "Pinta el campo y su error en destructive.",
      },
    ],
  },
  {
    id: "checkbox",
    name: "Checkbox",
    category: "entradas",
    kind: "ui",
    description: "Casilla para una o varias opciones independientes.",
    whenToUse: "Una lista de opciones que se marcan por separado.",
    whenNotToUse:
      "Una elección exclusiva: RadioGroup. Un encendido inmediato: Switch.",
    importPath: "@/src/shared/components/ui/checkbox",
    snippet: `import { Checkbox } from "@/src/shared/components/ui/checkbox"

<Checkbox id="remember" defaultChecked />
<Label htmlFor="remember">Recordar destino</Label>`,
    subcomponents: [],
    anatomy: [{ name: "Checkbox" }],
    variants: [
      { name: "states", values: "checked, unchecked, indeterminate, disabled" },
    ],
    props: [
      {
        name: "checked / defaultChecked",
        type: "boolean",
        description: "Estado controlado o inicial.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Cambio del estado.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea el control.",
      },
    ],
  },
  {
    id: "radio-group",
    name: "RadioGroup",
    category: "entradas",
    kind: "ui",
    description: "Grupo de opciones exclusivas.",
    whenToUse: "Elegir una sola opción entre pocas, con el nombre de cada una.",
    whenNotToUse:
      "Un catálogo largo o con descripciones: filas de elección con `FieldLabel`, `FieldMedia` y `RadioGroupItem` en una hoja. Tampoco para un encendido: Switch.",
    importPath: "@/src/shared/components/ui/radio-group",
    snippet: `import { RadioGroup, RadioGroupItem } from "@/src/shared/components/ui/radio-group"

<RadioGroup defaultValue="ahorros">
  <RadioGroupItem value="ahorros" id="savings" />
  <Label htmlFor="savings">Tema claro</Label>
</RadioGroup>`,
    subcomponents: ["RadioGroupItem"],
    anatomy: [
      {
        name: "RadioGroup",
        children: [{ name: "RadioGroupItem" }, { name: "Label" }],
      },
    ],
    variants: [
      { name: "value", values: "controlado o defaultValue" },
      { name: "states", values: "normal, selected, disabled" },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "Valor elegido.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Cambio de la opción elegida.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea el grupo completo.",
      },
    ],
  },
  {
    id: "switch",
    name: "Switch",
    category: "entradas",
    kind: "ui",
    description: "Interruptor de encendido que aplica al instante.",
    whenToUse: "Un ajuste binario con efecto inmediato.",
    whenNotToUse:
      'Una opción que se confirma al guardar: Checkbox. Tampoco dentro de una fila con icono: `Field` con `variant="card"`.',
    importPath: "@/src/shared/components/ui/switch",
    snippet: `import { Switch } from "@/src/shared/components/ui/switch"

<Switch checked={enabled} onCheckedChange={setEnabled} />`,
    subcomponents: [],
    anatomy: [{ name: "Switch" }],
    variants: [{ name: "states", values: "on, off, disabled, focus" }],
    props: [
      {
        name: "checked / defaultChecked",
        type: "boolean",
        description: "Estado controlado o inicial.",
      },
      {
        name: "onCheckedChange",
        type: "(checked: boolean) => void",
        description: "Cambio del interruptor.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea el control.",
      },
    ],
  },
  {
    id: "input-group",
    name: "InputGroup",
    category: "entradas",
    kind: "ui",
    description:
      "Envuelve un campo con iconos, texto o botones dentro del mismo control.",
    whenToUse:
      "Un campo de dato: `Field` + `FieldLabel` + `InputGroup` con el icono líder, y `FieldError` debajo. También un campo que necesita un sufijo o una acción pegada.",
    whenNotToUse: "Un campo simple sin adornos: Input directo dentro de Field.",
    importPath: "@/src/shared/components/ui/input-group",
    snippet: `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/src/shared/components/ui/input-group"

<InputGroup>
  <InputGroupAddon align="inline-start">
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Buscar" aria-label="Buscar" />
</InputGroup>`,
    subcomponents: [
      "InputGroupAddon",
      "InputGroupButton",
      "InputGroupText",
      "InputGroupInput",
      "InputGroupTextarea",
    ],
    anatomy: [
      {
        name: "InputGroup",
        children: [
          { name: "InputGroupAddon" },
          { name: "InputGroupInput" },
          { name: "InputGroupButton" },
        ],
      },
    ],
    variants: [
      {
        name: "align",
        values: "inline-start, inline-end, block-start, block-end",
      },
      { name: "size (Button)", values: "xs, sm, icon-xs, icon-sm" },
      { name: "states", values: "normal, focus, invalid, disabled" },
    ],
    props: [
      {
        name: "align",
        type: "InputGroupAddon alignment",
        description: "Posición del adorno dentro del grupo.",
      },
      {
        name: "className",
        type: "string",
        description: "Alto y ancho del grupo.",
      },
      {
        name: "size (InputGroupButton)",
        type: '"xs" | "sm" | "icon-xs" | "icon-sm"',
        description: "Alto del botón que vive dentro del grupo.",
      },
    ],
  },
  {
    id: "select",
    name: "Select",
    category: "entradas",
    kind: "ui",
    description: "Catálogo corto en un menú desplegable.",
    whenToUse:
      "Una lista corta y conocida donde el usuario ve todas las opciones de un vistazo.",
    whenNotToUse:
      "Un catálogo largo: se elige en una hoja desde una fila disparadora.",
    importPath: "@/src/shared/components/ui/select",
    snippet: `import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select"

<Select defaultValue="comfortable">
  <SelectTrigger icon={SlidersHorizontalIcon}>
    <SelectValue placeholder="Elige" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectItem value="comfortable">Cómoda</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
    subcomponents: [
      "SelectTrigger",
      "SelectValue",
      "SelectContent",
      "SelectGroup",
      "SelectLabel",
      "SelectItem",
      "SelectSeparator",
      "SelectScrollUpButton",
      "SelectScrollDownButton",
    ],
    anatomy: [
      {
        name: "Select",
        children: [
          { name: "SelectTrigger", children: [{ name: "SelectValue" }] },
          { name: "SelectContent", children: [{ name: "SelectItem" }] },
        ],
      },
    ],
    variants: [
      { name: "size", values: "sm, default" },
      { name: "states", values: "normal, open, invalid, disabled" },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "Opción elegida.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Cambio de la opción.",
      },
      {
        name: "items",
        type: "{ value, label }[]",
        description: "Etiquetas que muestra el disparador.",
      },
      {
        name: "icon (trigger)",
        type: "LucideIcon",
        description: "Icono líder del dato dentro del SelectTrigger.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea el select.",
      },
    ],
  },
  {
    id: "attachment",
    name: "Attachment",
    category: "entradas",
    kind: "ui",
    description:
      "Archivo adjunto con media, título, tamaño y acciones de quitar o abrir.",
    whenToUse:
      "Un archivo importado o la evidencia de un correo: estado de cuenta, captura o JSON.",
    whenNotToUse:
      "Una card de una entidad financiera: cada entidad tiene la suya.",
    importPath: "@/src/shared/components/ui/attachment",
    snippet: `import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/src/shared/components/ui/attachment"

<Attachment>
  <AttachmentMedia><FileTextIcon /></AttachmentMedia>
  <AttachmentContent>
    <AttachmentTitle>estado-de-cuenta.pdf</AttachmentTitle>
    <AttachmentDescription>PDF · 2.4 MB</AttachmentDescription>
  </AttachmentContent>
</Attachment>`,
    subcomponents: [
      "AttachmentGroup",
      "AttachmentMedia",
      "AttachmentContent",
      "AttachmentTitle",
      "AttachmentDescription",
      "AttachmentActions",
      "AttachmentAction",
      "AttachmentTrigger",
    ],
    anatomy: [
      {
        name: "Attachment",
        children: [
          { name: "AttachmentMedia" },
          { name: "AttachmentContent" },
          { name: "AttachmentActions" },
        ],
      },
    ],
    variants: [
      { name: "state", values: "idle, uploading, processing, error, done" },
      { name: "size", values: "default, sm, xs" },
      { name: "orientation", values: "horizontal, vertical" },
      { name: "variant (Media)", values: "icon, image" },
    ],
    props: [
      {
        name: "state",
        type: '"idle" | "uploading" | "processing" | "error" | "done"',
        description: "Estado visual del archivo.",
      },
      {
        name: "size",
        type: '"default" | "sm" | "xs"',
        description: "Escala del adjunto.",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "Fila compacta o tarjeta de archivo.",
      },
      {
        name: "variant (AttachmentMedia)",
        type: '"icon" | "image"',
        description: "Icono del tipo de archivo o una miniatura de imagen.",
      },
    ],
  },
  {
    id: "combobox",
    name: "Combobox",
    category: "entradas",
    kind: "ui",
    description:
      "Campo con búsqueda y lista de opciones para un catálogo medio o largo.",
    whenToUse:
      "Elegir un valor de una lista que se filtra al escribir, sin abrir una hoja.",
    whenNotToUse:
      "Un catálogo largo de una pantalla de producto: la regla del proyecto manda una hoja de selección por ruta.",
    importPath: "@/src/shared/components/ui/combobox",
    snippet: `import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/src/shared/components/ui/combobox"

<Combobox items={items}>
  <ComboboxInput placeholder="Buscar" aria-label="Buscar" />
  <ComboboxContent>
    <ComboboxEmpty>Sin resultados</ComboboxEmpty>
    <ComboboxList>
      {(item) => <ComboboxItem key={item} value={item}>{item}</ComboboxItem>}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
    subcomponents: [
      "ComboboxInput",
      "ComboboxContent",
      "ComboboxList",
      "ComboboxItem",
      "ComboboxGroup",
      "ComboboxLabel",
      "ComboboxCollection",
      "ComboboxEmpty",
      "ComboboxSeparator",
      "ComboboxChips",
      "ComboboxChip",
      "ComboboxChipsInput",
      "ComboboxTrigger",
      "ComboboxValue",
    ],
    anatomy: [
      {
        name: "Combobox",
        children: [
          { name: "ComboboxInput" },
          {
            name: "ComboboxContent",
            children: [
              { name: "ComboboxList", children: [{ name: "ComboboxItem" }] },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "mode", values: "single, multiple con ComboboxChips" },
      { name: "states", values: "closed, open, empty, disabled" },
    ],
    props: [
      {
        name: "items",
        type: "readonly T[]",
        description: "Opciones que filtra y recorre la lista.",
      },
      {
        name: "value / onValueChange",
        type: "controlled value",
        description: "Selección controlada.",
      },
      {
        name: "disabled",
        type: "boolean",
        description: "Bloquea la búsqueda y la lista.",
      },
    ],
  },
]
