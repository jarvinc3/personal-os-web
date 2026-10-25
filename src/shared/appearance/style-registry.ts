export type AppearanceStyle = {
  id: string
  label: string
  description: string
}

/**
 * Registro único de estilos visuales. Agregar un estilo es agregar su entrada
 * aquí, su archivo CSS en `styles/` y la línea de importación en `styles/index.css`.
 */
export const APPEARANCE_STYLES = [
  {
    id: "studio",
    label: "Estudio",
    description: "Superficies planas, bordes finos y sombras suaves.",
  },
  {
    id: "neo-skeuo",
    label: "Neo-Skeuo",
    description:
      "Papel, tinta y volumen: relieve en dos tonos y radios cortos.",
  },
] as const satisfies readonly AppearanceStyle[]

export type AppearanceStyleId = (typeof APPEARANCE_STYLES)[number]["id"]

export const DEFAULT_APPEARANCE_STYLE: AppearanceStyleId = "studio"

const STYLE_BY_ID = new Map<string, AppearanceStyle>(
  APPEARANCE_STYLES.map((style) => [style.id, style])
)

export function isAppearanceStyleId(
  value: unknown
): value is AppearanceStyleId {
  return typeof value === "string" && STYLE_BY_ID.has(value)
}

export function findAppearanceStyle(id: string): AppearanceStyle | undefined {
  return STYLE_BY_ID.get(id)
}
