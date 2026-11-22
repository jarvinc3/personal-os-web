import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

const CARD_SNIPPET = `import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Resumen del mes</CardTitle>
    <CardDescription>Movimientos y pendientes</CardDescription>
  </CardHeader>
  <CardContent>12 movimientos</CardContent>
</Card>`

const CODE_BLOCK_SNIPPET = `import {
  CodeBlock,
  CodeBlockContent,
} from "@/src/shared/components/ui/code-block"

<CodeBlock>
  <CodeBlockContent>{code}</CodeBlockContent>
</CodeBlock>`

export const estructuraDocs: readonly GalleryComponentMeta[] = [
  {
    id: "card",
    name: "Card",
    category: "estructura",
    kind: "ui",
    description:
      "Contenedor con borde, fondo y partes para título, descripción, acciones y pie.",
    whenToUse:
      "Un contenedor genérico en una vista de documentación o en una composición de shadcn.",
    whenNotToUse:
      "En pantallas de producto el bloque con título es SummarySection; Card no la sustituye.",
    importPath: "@/src/shared/components/ui/card",
    snippet: CARD_SNIPPET,
    subcomponents: [
      "CardHeader",
      "CardTitle",
      "CardDescription",
      "CardAction",
      "CardContent",
      "CardFooter",
    ],
    anatomy: [
      {
        name: "Card",
        children: [
          { name: "CardHeader" },
          { name: "CardContent" },
          { name: "CardFooter" },
        ],
      },
    ],
    variants: [
      { name: "size", values: "default, sm" },
      { name: "className", values: "ajustes de ancho y composición" },
    ],
    props: [
      {
        name: "size",
        type: '"default" | "sm"',
        description: "Reduce el espaciado interno y los radios de las partes.",
      },
      {
        name: "className",
        type: "string",
        description:
          "Ancho y composición; el color y el borde ya vienen del tema.",
      },
    ],
  },
  {
    id: "separator",
    name: "Separator",
    category: "estructura",
    kind: "ui",
    description: "Línea semántica que separa grupos de contenido.",
    whenToUse:
      "Entre dos bloques o filas cuando el borde de la card no alcanza a marcar el corte.",
    whenNotToUse:
      "Para separar los ítems de una lista con borde propio; ahí el espaciado basta.",
    importPath: "@/src/shared/components/ui/separator",
    snippet: `import { Separator } from "@/src/shared/components/ui/separator"

<Separator />`,
    subcomponents: [],
    anatomy: [{ name: "Separator" }],
    variants: [{ name: "orientation", values: "horizontal, vertical" }],
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        description: "Dirección de la línea.",
      },
      {
        name: "decorative",
        type: "boolean",
        description: "Lo oculta a lectores de pantalla cuando es solo visual.",
      },
    ],
  },
  {
    id: "scroll-area",
    name: "ScrollArea",
    category: "estructura",
    kind: "ui",
    description: "Región con scroll propio y barra estilizada.",
    whenToUse:
      "Un panel corto con muchas filas o una lista dentro de una card que no debe estirar la página.",
    whenNotToUse:
      "La lista principal de una vista: ahí el scroll es de la página y las filas cargan por scroll infinito.",
    importPath: "@/src/shared/components/ui/scroll-area",
    snippet: `import { ScrollArea } from "@/src/shared/components/ui/scroll-area"

<ScrollArea className="h-40">
  <div className="flex flex-col gap-2">{rows}</div>
</ScrollArea>`,
    subcomponents: ["ScrollBar"],
    anatomy: [{ name: "ScrollArea", children: [{ name: "ScrollBar" }] }],
    variants: [
      {
        name: "orientation",
        values: "vertical (barra), horizontal con ScrollBar",
      },
    ],
    props: [
      {
        name: "className",
        type: "string",
        description: "Altura o ancho máximo de la región.",
      },
      {
        name: "children",
        type: "ReactNode",
        description: "Contenido desplazable.",
      },
    ],
  },
  {
    id: "code-block",
    name: "CodeBlock",
    category: "estructura",
    kind: "ui",
    description:
      "Bloque de código con cabecera, título, acciones y botón de copiar.",
    whenToUse:
      "Documentación y snippets que se copian. La galería lo usa en cada ficha.",
    whenNotToUse:
      "Para mostrar texto normal o una ruta de importación corta; ahí basta un code inline.",
    importPath: "@/src/shared/components/ui/code-block",
    snippet: CODE_BLOCK_SNIPPET,
    subcomponents: [
      "CodeBlockHeader",
      "CodeBlockTitle",
      "CodeBlockActions",
      "CodeBlockCopyButton",
      "CodeBlockContent",
      "CodeBlockLine",
      "CodeBlockFooter",
    ],
    anatomy: [
      {
        name: "CodeBlock",
        children: [{ name: "CodeBlockHeader" }, { name: "CodeBlockContent" }],
      },
    ],
    variants: [
      { name: "variant", values: "default, destructive" },
      { name: "size", values: "default, sm" },
      { name: "states", values: "copiado, con wrap, con números de línea" },
    ],
    props: [
      {
        name: "variant",
        type: '"default" | "destructive"',
        description: "Aspecto del bloque para código normal o un fallo.",
      },
      {
        name: "size",
        type: '"default" | "sm"',
        description: "Escala del texto y del espaciado.",
      },
      {
        name: "value (CopyButton)",
        type: "string",
        description: "Texto que se copia al portapapeles.",
      },
    ],
  },
]
