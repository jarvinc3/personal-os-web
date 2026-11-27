import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const listasDocs: readonly GalleryComponentMeta[] = [
  {
    id: "item",
    name: "Item",
    category: "listas",
    kind: "ui",
    description:
      "Fila de composición libre con media, contenido, acciones, cabecera y pie.",
    whenToUse:
      "Una fila de lista o un bloque de resultado que combina varios nodos.",
    whenNotToUse:
      "Una entidad de Finanzas: se pinta con su card. Un grupo con título: SummarySection o ItemGroup con encabezado.",
    importPath: "@/src/shared/components/ui/item",
    snippet: `import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { InboxIcon } from "lucide-react"

<Item>
  <ItemMedia variant="icon"><InboxIcon /></ItemMedia>
  <ItemContent>
    <ItemTitle>Importación completada</ItemTitle>
    <ItemDescription>12 movimientos</ItemDescription>
  </ItemContent>
</Item>`,
    subcomponents: [
      "ItemGroup",
      "ItemMedia",
      "ItemContent",
      "ItemTitle",
      "ItemDescription",
      "ItemActions",
      "ItemSeparator",
      "ItemHeader",
      "ItemFooter",
    ],
    anatomy: [
      {
        name: "Item",
        children: [
          { name: "ItemMedia" },
          {
            name: "ItemContent",
            children: [{ name: "ItemTitle" }, { name: "ItemDescription" }],
          },
          { name: "ItemActions" },
        ],
      },
    ],
    variants: [
      { name: "variant", values: "default, outline, muted, plain" },
      { name: "size", values: "default, sm, xs" },
      { name: "variant (Media)", values: "default, icon, image" },
      {
        name: "states",
        values: "normal, interactive (render), disabled por el padre",
      },
    ],
    props: [
      {
        name: "variant",
        type: '"default" | "outline" | "muted" | "plain"',
        description:
          "Borde y fondo de la fila. plain no pinta superficie y sirve para filas dentro de una Card.",
      },
      {
        name: "size",
        type: '"default" | "sm" | "xs"',
        description: "Espaciado y tamaño de la media.",
      },
      {
        name: "variant (ItemMedia)",
        type: '"default" | "icon" | "image"',
        description: "Media sin fondo, icono en círculo o miniatura.",
      },
      {
        name: "render",
        type: "RenderProp",
        description: "Convierte la fila en un Link o un botón con su pending.",
      },
    ],
  },
  {
    id: "marker",
    name: "Marker",
    category: "listas",
    kind: "ui",
    description:
      "Línea corta de contexto con icono, separador o borde inferior.",
    whenToUse:
      "Una nota de estado dentro de una lista o entre dos grupos de filas.",
    whenNotToUse:
      "Una fila con título y valor: SummaryItem. Un aviso: Alert o NoticeCard.",
    importPath: "@/src/shared/components/ui/marker",
    snippet: `import {
  Marker,
  MarkerContent,
  MarkerIcon,
} from "@/src/shared/components/ui/marker"

<Marker>
  <MarkerIcon><BellIcon /></MarkerIcon>
  <MarkerContent>Sincronización en curso</MarkerContent>
</Marker>`,
    subcomponents: ["MarkerIcon", "MarkerContent"],
    anatomy: [
      {
        name: "Marker",
        children: [{ name: "MarkerIcon" }, { name: "MarkerContent" }],
      },
    ],
    variants: [{ name: "variant", values: "default, separator, border" }],
    props: [
      {
        name: "variant",
        type: '"default" | "separator" | "border"',
        description: "Línea a los lados, borde inferior o sin adorno.",
      },
      {
        name: "render",
        type: "RenderProp",
        description: "Convierte el marker en un enlace o botón.",
      },
    ],
  },
  {
    id: "summary-item",
    name: "SummaryItem",
    category: "listas",
    kind: "domain",
    description:
      "Fila canónica de una lista: media circular, título, descripción, valor y chevron.",
    whenToUse:
      "Una fila dentro de SummarySection o de una Card con ItemGroup, con href o onPress.",
    whenNotToUse:
      "Una entidad de Finanzas: su card. Un grupo sin sección: no envuelvas la fila en un div de borde a mano.",
    importPath: "@/src/shared/components/data-display/summary",
    snippet: `import { SummaryItem } from "@/src/shared/components/data-display/summary"
import { FileTextIcon } from "lucide-react"

<SummaryItem
  title="Exportar los datos"
  description="Copia de seguridad"
  value="JSON"
  icon={FileTextIcon}
  href={href}
/>`,
    subcomponents: [],
    anatomy: [{ name: "SummaryItem" }],
    variants: [
      {
        name: "href / onPress",
        values: "enlace con pending o acción sin overlay",
      },
      { name: "tintRow", values: "true con accentColor, false por defecto" },
      { name: "states", values: "normal, hover, disabled" },
    ],
    props: [
      {
        name: "href",
        type: "Link href",
        description: "Abre otra vista con LinkPendingOverlay.",
      },
      {
        name: "onPress",
        type: "() => void",
        description: "Acción local de la fila; no pinta overlay.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono dentro de la media circular.",
      },
      {
        name: "value",
        type: "ReactNode",
        description: "Valor a la derecha, normalmente tabular-nums.",
      },
    ],
  },
  {
    id: "accordion",
    name: "Accordion",
    category: "listas",
    kind: "ui",
    description: "Bloques plegables con encabezado y panel animado.",
    whenToUse:
      "Contenido secundario que se abre bajo demanda, como ayuda o detalle.",
    whenNotToUse:
      "El bloque con título de una vista normal: SummarySection collapsible.",
    importPath: "@/src/shared/components/ui/accordion",
    snippet: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/shared/components/ui/accordion"

<Accordion>
  <AccordionItem value="help">
    <AccordionTrigger>¿Qué datos se importan?</AccordionTrigger>
    <AccordionContent>…</AccordionContent>
  </AccordionItem>
</Accordion>`,
    subcomponents: ["AccordionItem", "AccordionTrigger", "AccordionContent"],
    anatomy: [
      {
        name: "Accordion",
        children: [
          {
            name: "AccordionItem",
            children: [
              { name: "AccordionTrigger" },
              { name: "AccordionContent" },
            ],
          },
        ],
      },
    ],
    variants: [
      { name: "multiple", values: "false, true" },
      { name: "states", values: "open, closed, disabled" },
    ],
    props: [
      {
        name: "defaultValue",
        type: "string[]",
        description: "Paneles abiertos al montar.",
      },
      {
        name: "multiple",
        type: "boolean",
        description: "Permite más de un panel abierto.",
      },
    ],
  },
  {
    id: "avatar",
    name: "Avatar",
    category: "listas",
    kind: "ui",
    description:
      "Imagen circular de una persona con iniciales de respaldo y grupo.",
    whenToUse: "El perfil de una persona, dentro de una fila o un encabezado.",
    whenNotToUse: "La marca de una cuenta, tarjeta o comercio: BrandLogo.",
    importPath: "@/src/shared/components/ui/avatar",
    snippet: `import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar"

<Avatar>
  <AvatarImage src={url} alt={name} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>`,
    subcomponents: [
      "AvatarImage",
      "AvatarFallback",
      "AvatarGroup",
      "AvatarGroupCount",
      "AvatarBadge",
    ],
    anatomy: [
      {
        name: "Avatar",
        children: [{ name: "AvatarImage" }, { name: "AvatarFallback" }],
      },
    ],
    variants: [
      { name: "size", values: "sm, default, lg" },
      { name: "states", values: "image, fallback, missing image" },
    ],
    props: [
      {
        name: "size",
        type: '"sm" | "default" | "lg"',
        description: "Diámetro del avatar.",
      },
      {
        name: "src / alt (AvatarImage)",
        type: "string",
        description: "Imagen y su texto alternativo.",
      },
    ],
  },
]
