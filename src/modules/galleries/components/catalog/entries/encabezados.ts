import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const encabezadosDocs: readonly GalleryComponentMeta[] = [
  {
    id: "summary-section",
    name: "SummarySection",
    category: "encabezados",
    kind: "domain",
    description:
      "Bloque con título, icono, subtítulo y acción a la derecha, con su card alrededor.",
    whenToUse:
      "El chrome de cualquier bloque con título: listas, formularios, sheets y paneles.",
    whenNotToUse:
      "Un grupo de ajustes con etiqueta corta: SettingsSection. En pantallas de producto no se usa Card en su lugar.",
    importPath: "@/src/shared/components/data-display/summary",
    snippet: `import {
  SummaryItem,
  SummarySection,
} from "@/src/shared/components/data-display/summary"

<SummarySection title="Resumen del mes" icon={LandmarkIcon}>
  <SummaryItem title="Movimientos" value="12" />
</SummarySection>`,
    subcomponents: [],
    anatomy:
      "<SummarySection title icon subtitle right collapsible><SummaryItem /></SummarySection>",
    variants: [
      { name: "collapsible", values: "false, true con defaultOpen" },
      { name: "color", values: "acento del módulo en icono y fondo" },
    ],
    props: [
      {
        name: "title / subtitle",
        type: "string",
        description: "Encabezado del bloque.",
      },
      {
        name: "icon",
        type: "LucideIcon",
        description: "Icono del bloque, obligatorio en la práctica.",
      },
      {
        name: "right",
        type: "ReactNode",
        description: "Acción o badge a la derecha del título.",
      },
      {
        name: "collapsible / defaultOpen",
        type: "boolean",
        description: "Pliega el cuerpo y decide si arranca abierto.",
      },
    ],
  },
  {
    id: "summary-group",
    name: "SummaryGroup",
    category: "encabezados",
    kind: "domain",
    description:
      "Título corto con línea y descripción para agrupar varios controles dentro de una sección.",
    whenToUse:
      "Un subconcepto dentro de una sección, como el saldo inicial de un cálculo.",
    whenNotToUse: "Un bloque principal con icono: SummarySection.",
    importPath: "@/src/shared/components/data-display/summary",
    snippet: `import { SummaryGroup } from "@/src/shared/components/data-display/summary"

<SummaryGroup title="Saldo inicial" description="Antes de los movimientos">
  {rows}
</SummaryGroup>`,
    subcomponents: [],
    anatomy: "<SummaryGroup title description>{rows}</SummaryGroup>",
    variants: [{ name: "description", values: "opcional, debajo del título" }],
    props: [
      {
        name: "title",
        type: "string",
        description: "Etiqueta corta con línea al lado.",
      },
      {
        name: "description",
        type: "string",
        description: "Contexto del grupo.",
      },
    ],
  },
  {
    id: "settings-section",
    name: "SettingsSection",
    category: "encabezados",
    kind: "domain",
    description:
      "Grupo con etiqueta corta en mayúsculas y una card opcional alrededor.",
    whenToUse:
      "Un grupo de ajustes o de filas con una etiqueta corta, sin icono en el encabezado.",
    whenNotToUse:
      "Un bloque de producto con título e icono: SummarySection. No armes un div con borde a mano.",
    importPath: "@/src/shared/components/settings/settings-section",
    snippet: `import { SettingsSection } from "@/src/shared/components/settings/settings-section"

<SettingsSection title="Datos" description="Exporta o elimina tu información">
  {rows}
</SettingsSection>`,
    subcomponents: [],
    anatomy:
      "<SettingsSection title description headerTrailing bare>{rows}</SettingsSection>",
    variants: [
      { name: "bare", values: "false (card propia), true (sin card)" },
      { name: "headerTrailing", values: "acción a la derecha del título" },
    ],
    props: [
      {
        name: "title",
        type: "string",
        description: "Etiqueta corta en mayúsculas.",
      },
      {
        name: "description",
        type: "string",
        description: "Texto secundario bajo la etiqueta.",
      },
      {
        name: "bare",
        type: "boolean",
        description: "Quita la card para que el padre la ponga.",
      },
    ],
  },
  {
    id: "detail-header",
    name: "DetailHeader",
    category: "encabezados",
    kind: "domain",
    description:
      "Encabezado de un detalle sobre color: media, título, insignia y subtítulo.",
    whenToUse:
      "La cabecera de un detalle de Finanzas sobre el color de la entidad.",
    whenNotToUse: "El header de una ruta normal: usePageHeader.",
    importPath: "@/src/modules/finance/shared/components/layout/progress-hero",
    snippet: `import { DetailHeader } from "@/src/modules/finance/shared/components/layout/progress-hero"

<DetailHeader
  media={<BrandLogo name={name} size={48} />}
  title={title}
  badge={{ label: "Activa" }}
  subtitle={subtitle}
/>`,
    subcomponents: [],
    anatomy: "<DetailHeader media title badge subtitle />",
    variants: [
      { name: "badge", values: "sin insignia, con label y variant" },
      { name: "media", values: "BrandLogo u otro nodo de 48 px" },
    ],
    props: [
      {
        name: "media",
        type: "ReactNode",
        description: "Marca o icono a la izquierda.",
      },
      {
        name: "title",
        type: "string",
        description: "Título grande del detalle.",
      },
      {
        name: "badge",
        type: "{ label, variant? }",
        description: "Insignia sobre el color de la entidad.",
      },
    ],
  },
  {
    id: "collapsible",
    name: "Collapsible",
    category: "encabezados",
    kind: "ui",
    description: "Región que se abre y cierra desde un disparador.",
    whenToUse: "Un bloque secundario o un detalle que se consulta a demanda.",
    whenNotToUse:
      "Varias preguntas plegables: Accordion. Un bloque con sección: SummarySection collapsible.",
    importPath: "@/src/shared/components/ui/collapsible",
    snippet: `import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/shared/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger>Detalle del cálculo</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`,
    subcomponents: ["CollapsibleTrigger", "CollapsibleContent"],
    anatomy:
      "<Collapsible><CollapsibleTrigger /><CollapsibleContent /></Collapsible>",
    variants: [
      { name: "defaultOpen", values: "false, true" },
      { name: "states", values: "open, closed, disabled" },
    ],
    props: [
      {
        name: "defaultOpen",
        type: "boolean",
        description: "Estado inicial del panel.",
      },
      {
        name: "open / onOpenChange",
        type: "controlled state",
        description: "Panel controlado.",
      },
    ],
  },
]
