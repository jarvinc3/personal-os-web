const EMOJI_GRAPHEME = /\p{Extended_Pictographic}/u

function graphemes(value: string): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" })
  return [...segmenter.segment(value)].map((part) => part.segment)
}

export function isSingleEmoji(value: string): boolean {
  const trimmed = value.trim()
  if (!trimmed) {
    return false
  }
  const parts = graphemes(trimmed)
  return parts.length === 1 && EMOJI_GRAPHEME.test(parts[0] ?? "")
}

/** Keeps the first emoji grapheme. Letters and other characters are dropped. */
export function takeSingleEmoji(value: string): string {
  for (const part of graphemes(value)) {
    if (EMOJI_GRAPHEME.test(part)) {
      return part
    }
  }
  return ""
}
