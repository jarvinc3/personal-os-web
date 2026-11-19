import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const tabsDocs: readonly GalleryComponentMeta[] = [
  {
    id: "tabs",
    name: "Tabs",
    category: "tabs",
    kind: "ui",
    description:
      "Pestañas con indicador deslizante y paneles; variante por defecto o de línea.",
    whenToUse: "Dos o más superficies locales que no merecen una ruta propia.",
    whenNotToUse:
      "Un módulo hoja (Keep Awake) o secciones con URL: ModuleSectionLayout. En una pantalla de producto, el tab vive en la query.",
    importPath: "@/src/shared/components/ui/tabs",
    snippet: `import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs"

<Tabs defaultValue="expenses">
  <TabsList>
    <TabsTrigger value="expenses">Gastos</TabsTrigger>
    <TabsTrigger value="income">Ingresos</TabsTrigger>
  </TabsList>
  <TabsContent value="expenses">…</TabsContent>
</Tabs>`,
    subcomponents: ["TabsList", "TabsTrigger", "TabsContent"],
    anatomy: "<Tabs><TabsList><TabsTrigger /></TabsList><TabsContent /></Tabs>",
    variants: [
      { name: "variant (TabsList)", values: "default, line" },
      { name: "orientation", values: "horizontal, vertical" },
      { name: "states", values: "active, inactive, focus, disabled" },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "Tab activo controlado o inicial.",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "Cambio de tab.",
      },
      {
        name: "variant (TabsList)",
        type: '"default" | "line"',
        description: "Fondo de píldora o línea con indicador.",
      },
    ],
  },
  {
    id: "badge",
    name: "Badge",
    category: "tabs",
    kind: "ui",
    description: "Píldora corta de estado, conteo o etiqueta.",
    whenToUse:
      "Un estado, un conteo o una etiqueta corta junto a un título o una fila.",
    whenNotToUse:
      "Una acción: es un Button. La mención de una categoría con importe: CategoryCard chip.",
    importPath: "@/src/shared/components/ui/badge",
    snippet: `import { Badge } from "@/src/shared/components/ui/badge"

<Badge variant="warning">Por vencer</Badge>`,
    subcomponents: [],
    anatomy: "<Badge variant><Icon />Texto</Badge>",
    variants: [
      {
        name: "variant",
        values:
          "default, secondary, success, warning, info, danger, tinted, outline, destructive, ghost, link",
      },
    ],
    props: [
      {
        name: "variant",
        type: "badgeVariants",
        description: "Color semántico del estado.",
      },
      {
        name: "className",
        type: "string",
        description: "Fondo propio sobre color de entidad (tinted).",
      },
    ],
  },
  {
    id: "category-card",
    name: "CategoryCard",
    category: "tabs",
    kind: "domain",
    description:
      "Card de una categoría en cuatro densidades: fila, picker, chip o mención inline.",
    whenToUse:
      "Una categoría en el catálogo, en un selector o como chip con importe.",
    whenNotToUse:
      "Una categoría dentro de otra card con una fila propia; esta es su fila canónica.",
    importPath: "@/src/modules/finance/shared/components/category-card",
    snippet: `import { CategoryCard } from "@/src/modules/finance/shared/components/category-card"

<CategoryCard
  name={category.name}
  icon={category.icon}
  color={category.color}
  isSystem={category.isSystem}
  amount={amount}
  variant="chip"
  onPress={onPress}
/>`,
    subcomponents: [],
    anatomy: "<CategoryCard name icon color isSystem variant amount />",
    variants: [
      { name: "variant", values: "default, pick, chip, inline" },
      { name: "states", values: "normal, selected, disabled" },
    ],
    props: [
      {
        name: "variant",
        type: '"default" | "pick" | "chip" | "inline"',
        description: "Densidad de la card.",
      },
      {
        name: "icon",
        type: "string | null",
        description: "Emoji de la categoría.",
      },
      {
        name: "amount",
        type: "string",
        description: "Importe ya formateado; solo lo usa el chip.",
      },
      {
        name: "onPress",
        type: "() => void",
        description: "Acción al tocar la card.",
      },
    ],
  },
]
