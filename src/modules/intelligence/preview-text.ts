const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  emsp: " ",
  ensp: " ",
  gt: ">",
  hairsp: " ",
  lt: "<",
  nbsp: " ",
  quot: '"',
  shy: "",
  thinsp: " ",
  zerowidthspace: "",
  zwj: "",
  zwnj: "",
}

const INVISIBLE_CHARACTERS =
  /[\u00ad\u034f\u061c\u115f\u1160\u17b4\u17b5\u180b-\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\u3164\ufe00-\ufe0f\ufeff\uffa0]/g

function decodeCodePoint(codePoint: number): string {
  if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) {
    return ""
  }
  return String.fromCodePoint(codePoint)
}

/**
 * The API sanitizer removes tags but can leave invisible entity sequences at
 * the start of a message. The preview decodes and drops them so the visible
 * text starts at the first real character.
 */
export function cleanPreviewText(value: string | null): string {
  if (!value) {
    return ""
  }
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      decodeCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, decimal: string) =>
      decodeCodePoint(Number(decimal))
    )
    .replace(/&([a-z][a-z0-9]+);/gi, (entity, name: string) => {
      return NAMED_ENTITIES[name.toLowerCase()] ?? entity
    })
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(/\u00a0/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}
