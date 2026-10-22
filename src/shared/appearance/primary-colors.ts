export type PrimaryColorOption = {
  id: string
  label: string
  hex: string
}

/** Paleta curada para el color primario. Todas llevan texto legible encima. */
export const PRIMARY_COLORS = [
  { id: "arena", label: "Arena", hex: "#D6C5B3" },
  { id: "terracota", label: "Terracota", hex: "#C97B5A" },
  { id: "salvia", label: "Salvia", hex: "#9CAF88" },
  { id: "oceano", label: "Océano", hex: "#3F6A9A" },
  { id: "ciruela", label: "Ciruela", hex: "#7D5A79" },
  { id: "grafito", label: "Grafito", hex: "#4B5563" },
  { id: "miel", label: "Miel", hex: "#D4A73C" },
  { id: "rosa", label: "Rosa", hex: "#C98B9B" },
] as const satisfies readonly PrimaryColorOption[]

export const DEFAULT_PRIMARY_COLOR = PRIMARY_COLORS[0].hex

export function findPrimaryColor(hex: string): PrimaryColorOption | undefined {
  const normalized = hex.toUpperCase()

  return PRIMARY_COLORS.find((option) => option.hex === normalized)
}
