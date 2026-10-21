export type HelpTextSegment =
  | { kind: "text"; value: string }
  | { kind: "term"; value: string; slug: string }
  | { kind: "guide"; value: string; slug: string }

const HELP_LINK_PATTERN = /\[\[([^\]|]+)\|([^\]]+)\]\]/g
const GUIDE_TARGET_PREFIX = "guia:"

/**
 * Reads the inline links of the help content: `[[texto|slug]]` opens a glossary
 * term and `[[texto|guia:slug]]` opens a guide.
 */
export function parseHelpText(text: string): readonly HelpTextSegment[] {
  const segments: HelpTextSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(HELP_LINK_PATTERN)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, index) })
    }

    const value = match[1]?.trim() ?? ""
    const target = match[2]?.trim() ?? ""
    if (!value || !target) {
      throw new Error(`Invalid help link in: ${text}`)
    }

    segments.push(
      target.startsWith(GUIDE_TARGET_PREFIX)
        ? {
            kind: "guide",
            value,
            slug: target.slice(GUIDE_TARGET_PREFIX.length),
          }
        : { kind: "term", value, slug: target }
    )
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) })
  }

  return segments
}
