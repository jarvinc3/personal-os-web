import type { GalleryComponentMeta } from "@/src/modules/galleries/components/catalog/types"

export const avisosDocs: readonly GalleryComponentMeta[] = [
  {
    id: "alert",
    name: "Alert",
    category: "avisos",
    kind: "ui",
    description:
      "Aviso en línea con tono, título, descripción y una acción opcional.",
    whenToUse:
      "Un aviso puntual dentro de un flujo que el usuario debe leer ahí mismo.",
    whenNotToUse:
      "El fallo de carga de una sección: ErrorState con reintento. Una mutación fallida: toast.",
    importPath: "@/src/shared/components/ui/alert",
    snippet: `import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"

<Alert>
  <InfoIcon />
  <AlertTitle>Importación en curso</AlertTitle>
  <AlertDescription>Los movimientos aparecen al terminar.</AlertDescription>
</Alert>`,
    subcomponents: ["AlertTitle", "AlertDescription", "AlertAction"],
    anatomy: [
      {
        name: "Alert",
        children: [
          { name: "AlertTitle" },
          { name: "AlertDescription" },
          { name: "AlertAction" },
        ],
      },
    ],
    variants: [
      { name: "variant", values: "default, destructive" },
      { name: "tono", values: "ALERT_TONE_CLASS_NAME.warning, .info" },
      {
        name: "lavado",
        values:
          "ALERT_SOFT_TONE_CLASS_NAME.warning, .destructive, .info, .success",
      },
    ],
    props: [
      {
        name: "variant",
        type: '"default" | "destructive"',
        description: "Tono del aviso.",
      },
      {
        name: "className",
        type: "string",
        description: "Tono warning o info con las clases compartidas.",
      },
    ],
  },
  {
    id: "app-toast",
    name: "appToast",
    category: "avisos",
    kind: "domain",
    description:
      "Toast de una mutación: éxito, error, información o aviso, con un segundo texto opcional.",
    whenToUse:
      "El resultado de guardar, borrar o sincronizar; no mueve el foco.",
    whenNotToUse:
      "Un error de un campo (FieldError) o un estado de sección (ErrorState). Ningún módulo importa sonner directo.",
    importPath: "@/src/shared/lib/app-toast",
    snippet: `import { appToast } from "@/src/shared/lib/app-toast"

appToast.success({ text1: "Movimiento guardado" })`,
    subcomponents: ["showUndoToast"],
    anatomy: [{ name: "appToast" }],
    variants: [
      { name: "tipo", values: "success, error, info, warning" },
      { name: "undo", values: "showUndoToast para una acción reversible" },
    ],
    props: [
      {
        name: "text1",
        type: "string",
        description: "Mensaje principal del toast.",
      },
      {
        name: "text2",
        type: "string",
        description: "Contexto o siguiente paso.",
      },
    ],
  },
  {
    id: "sonner",
    name: "Sonner",
    category: "avisos",
    kind: "ui",
    description:
      "Host de los toasts de la app. Se monta una vez en el layout; no se usa directo.",
    whenToUse:
      "En el layout de la app, una sola vez, para recibir los appToast.",
    whenNotToUse:
      "En una pantalla o un módulo: importa appToast, nunca sonner.",
    importPath: "@/src/shared/components/ui/sonner",
    snippet: `import { Toaster } from "@/src/shared/components/ui/sonner"

<Toaster />`,
    subcomponents: [],
    anatomy: [{ name: "Toaster" }],
    variants: [
      {
        name: "position",
        values: "top-center (configurado en el host)",
      },
    ],
    props: [
      {
        name: "position",
        type: "ToasterProps position",
        description: "Ubicación de los toasts.",
      },
      {
        name: "theme",
        type: "ToasterProps theme",
        description: "Tema claro u oscuro del host.",
      },
    ],
  },
]
