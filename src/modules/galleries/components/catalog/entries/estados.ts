import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const estadosDocs: readonly GalleryComponentMeta[] = [
  {
    id: "icon-badge",
    name: "IconBadge",
    category: "estados",
    kind: "domain",
    description:
      "Círculo con icono o contenido propio, con tono del sistema o color de entidad.",
    whenToUse:
      "La media de una fila, una card o un encabezado que no lleva marca.",
    whenNotToUse:
      "Una marca de cuenta, tarjeta o comercio: BrandLogo. Las iniciales pintadas a mano.",
    importPath: "@/src/shared/components/data-display/icon-badge",
    snippet: `import { IconBadge } from "@/src/shared/components/data-display/icon-badge"

<IconBadge icon={WalletIcon} tone="primary" />`,
    subcomponents: [],
    anatomy: "<IconBadge icon tone color size />",
    variants: [
      {
        name: "tone",
        values: "primary, success, warning, info, destructive, muted",
      },
      { name: "color", values: "acento de una entidad o categoría" },
      { name: "size", values: "número en px (48 por defecto)" },
    ],
    props: [
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono del círculo; se reemplaza por children.",
      },
      {
        name: "tone",
        type: "IconBadgeTone",
        description: "Color semántico del círculo.",
      },
      {
        name: "color",
        type: "string",
        description: "Acento propio; gana sobre tone.",
      },
      {
        name: "size",
        type: "number",
        description: "Diámetro en px.",
      },
    ],
  },
  {
    id: "empty",
    name: "Empty",
    category: "estados",
    kind: "ui",
    description:
      "Estado vacío de una colección, con icono, título, descripción y acción.",
    whenToUse: "Cero ítems de una colección o una búsqueda sin resultados.",
    whenNotToUse:
      "Un fallo de carga: ErrorState con reintento. Tampoco un párrafo muted suelto.",
    importPath: "@/src/shared/components/ui/empty",
    snippet: `import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"

<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon"><WalletIcon /></EmptyMedia>
    <EmptyTitle>Sin cuentas todavía</EmptyTitle>
    <EmptyDescription>Agrega una cuenta para empezar.</EmptyDescription>
  </EmptyHeader>
</Empty>`,
    subcomponents: [
      "EmptyHeader",
      "EmptyMedia",
      "EmptyTitle",
      "EmptyDescription",
      "EmptyContent",
    ],
    anatomy:
      "<Empty><EmptyHeader><EmptyMedia /><EmptyTitle /><EmptyDescription /></EmptyHeader><EmptyContent /></Empty>",
    variants: [
      { name: "variant (EmptyMedia)", values: "default, icon" },
      {
        name: "size",
        values: "normal, compacta con EMPTY_COMPACT_CLASS_NAME",
      },
    ],
    props: [
      {
        name: "className",
        type: "string",
        description: "Borde y padding del bloque.",
      },
      {
        name: "children",
        type: "ReactNode",
        description:
          "Composición de Header, Media, Title, Description y Content.",
      },
    ],
  },
  {
    id: "skeleton",
    name: "Skeleton",
    category: "estados",
    kind: "ui",
    description: "Bloque gris con la forma del contenido que va a llegar.",
    whenToUse:
      "Mientras llega la primera tanda de una sección cuya forma se conoce.",
    whenNotToUse:
      "Un spinner suelto en medio del contenido; el Spinner va dentro de un control.",
    importPath: "@/src/shared/components/ui/skeleton",
    snippet: `import { Skeleton } from "@/src/shared/components/ui/skeleton"

<Skeleton className="h-4 w-32" />`,
    subcomponents: [],
    anatomy: "<Skeleton className />",
    variants: [
      { name: "className", values: "alto, ancho y radio de la forma real" },
    ],
    props: [
      {
        name: "className",
        type: "string",
        description: "Forma y tamaño del hueco.",
      },
    ],
  },
  {
    id: "list-skeleton",
    name: "ListSkeleton",
    category: "estados",
    kind: "domain",
    description:
      "Esqueleto de filas de una lista, con el alto de la fila real.",
    whenToUse: "La primera carga de una lista de Finanzas.",
    whenNotToUse:
      "La carga de cards o de un gráfico: el esqueleto de esa vista.",
    importPath: "@/src/shared/components/feedback/list-skeleton",
    snippet: `import { ListSkeleton } from "@/src/shared/components/feedback/list-skeleton"

<ListSkeleton rows={3} />`,
    subcomponents: [],
    anatomy: "<ListSkeleton rows />",
    variants: [{ name: "rows", values: "número de filas a dibujar" }],
    props: [
      {
        name: "rows",
        type: "number",
        description: "Cantidad de filas de ejemplo.",
      },
    ],
  },
  {
    id: "card-skeleton",
    name: "CardSkeleton",
    category: "estados",
    kind: "domain",
    description: "Esqueleto de una card con la altura de su variante.",
    whenToUse: "Mientras llegan las cards de una pila o un carrusel.",
    whenNotToUse: "Una lista de filas: ListSkeleton.",
    importPath: "@/src/shared/components/feedback/list-skeleton",
    snippet: `import { CardSkeleton } from "@/src/shared/components/feedback/list-skeleton"

<CardSkeleton height={28} />`,
    subcomponents: [],
    anatomy: "<CardSkeleton height />",
    variants: [{ name: "height", values: "16, 28, 40 (unidades del layout)" }],
    props: [
      {
        name: "height",
        type: "number",
        description: "Altura de la card que reemplaza.",
      },
    ],
  },
  {
    id: "loading-view",
    name: "LoadingView",
    category: "estados",
    kind: "domain",
    description:
      "Carga de una página o de una sección que todavía no tiene forma.",
    whenToUse:
      "Cuando la página aún no sabe si el registro existe ni cuántas filas habrá.",
    whenNotToUse: "Una sección cuya forma ya se conoce: su esqueleto.",
    importPath: "@/src/shared/components/feedback/loading-view",
    snippet: `import { LoadingView } from "@/src/shared/components/feedback/loading-view"

<LoadingView variant="inline" />`,
    subcomponents: [],
    anatomy: "<LoadingView variant />",
    variants: [{ name: "variant", values: "screen, inline" }],
    props: [
      {
        name: "variant",
        type: '"screen" | "inline"',
        description: "Carga de pantalla completa o dentro de un bloque.",
      },
    ],
  },
  {
    id: "error-state",
    name: "ErrorState",
    category: "estados",
    kind: "domain",
    description: "Fallo de carga con mensaje y botón de reintentar.",
    whenToUse:
      "Un fallo al cargar una sección, en el mismo sitio del contenido.",
    whenNotToUse:
      "Un error de un campo (FieldError) o de una mutación (toast).",
    importPath: "@/src/shared/components/feedback/error-state",
    snippet: `import { ErrorState } from "@/src/shared/components/feedback/error-state"

<ErrorState message="El servidor no respondió." onRetry={onRetry} />`,
    subcomponents: [],
    anatomy: "<ErrorState message onRetry isRetrying />",
    variants: [{ name: "states", values: "error, reintentando" }],
    props: [
      {
        name: "message",
        type: "string",
        description: "Texto del fallo.",
      },
      {
        name: "onRetry",
        type: "() => void",
        description: "Reintento de la carga.",
      },
      {
        name: "isRetrying",
        type: "boolean",
        description: "Deshabilita el botón y muestra el pending.",
      },
    ],
  },
  {
    id: "spinner",
    name: "Spinner",
    category: "estados",
    kind: "ui",
    description: "Indicador de actividad para dentro de un control existente.",
    whenToUse:
      "El botón que guarda, el Link que navega o el pie de una lista infinita.",
    whenNotToUse:
      "El hueco de una sección que ya tiene forma: ahí va su Skeleton.",
    importPath: "@/src/shared/components/ui/spinner",
    snippet: `import { Spinner } from "@/src/shared/components/ui/spinner"

<Button disabled>
  <Spinner />
  Cargando
</Button>`,
    subcomponents: [],
    anatomy: "<Spinner />",
    variants: [{ name: "className", values: "tamaño y color del contexto" }],
    props: [
      {
        name: "className",
        type: "string",
        description: "Ajuste de tamaño cuando el control no lo impone.",
      },
    ],
  },
]
