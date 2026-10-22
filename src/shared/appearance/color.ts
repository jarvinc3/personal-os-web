const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i

/** Texto negro o blanco: el de mayor contraste sobre el color elegido. */
export const BLACK_TEXT = "#000000"
export const WHITE_TEXT = "#FFFFFF"

export type PrimaryColorTokens = {
  primary: string
  primaryForeground: string
  ring: string
}

function channelToLinear(channel: number): number {
  const normalized = channel / 255

  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4
}

/** Devuelve el color en mayúsculas y de seis dígitos, o `null` si no es un hex válido. */
export function normalizeHexColor(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return null
  }

  const digits = trimmed.slice(1).toLowerCase()
  const expanded =
    digits.length === 3
      ? digits
          .split("")
          .map((digit) => `${digit}${digit}`)
          .join("")
      : digits

  return `#${expanded.toUpperCase()}`
}

export function relativeLuminance(hex: string): number {
  const color = normalizeHexColor(hex)
  if (!color) {
    throw new Error(`Color hexadecimal inválido: ${hex}`)
  }

  const channels = [1, 3, 5].map((offset) =>
    parseInt(color.slice(offset, offset + 2), 16)
  )

  return (
    0.2126 * channelToLinear(channels[0]) +
    0.7152 * channelToLinear(channels[1]) +
    0.0722 * channelToLinear(channels[2])
  )
}

export function contrastRatio(firstHex: string, secondHex: string): number {
  const first = relativeLuminance(firstHex)
  const second = relativeLuminance(secondHex)
  const lighter = Math.max(first, second)
  const darker = Math.min(first, second)

  return (lighter + 0.05) / (darker + 0.05)
}

export function readableTextColor(backgroundHex: string): string {
  return contrastRatio(backgroundHex, BLACK_TEXT) >=
    contrastRatio(backgroundHex, WHITE_TEXT)
    ? BLACK_TEXT
    : WHITE_TEXT
}

export function getPrimaryColorTokens(hex: string): PrimaryColorTokens {
  const primary = normalizeHexColor(hex)
  if (!primary) {
    throw new Error(`Color hexadecimal inválido: ${hex}`)
  }

  return {
    primary,
    primaryForeground: readableTextColor(primary),
    ring: primary,
  }
}
