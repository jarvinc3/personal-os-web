import { foldSearchText } from "@/src/shared/lib/search-text"

/** Trozo de un texto: si `isMatch`, se pinta resaltado. */
export type HighlightSegment = {
  text: string
  isMatch: boolean
}

/** Marcas que NFD separa de su letra base (tildes, diéresis, virgulilla). */
const COMBINING_MARKS = /\p{M}/gu

type FoldedText = {
  /** El texto sin acentos y en minúsculas. */
  folded: string
  /** Desde qué posición del texto original empieza cada carácter plegado. */
  startIndexes: readonly number[]
  /** Hasta qué posición del texto original llega cada carácter plegado. */
  endIndexes: readonly number[]
}

function foldChar(char: string): string {
  return char.normalize("NFD").replace(COMBINING_MARKS, "").toLowerCase()
}

/**
 * Pliega el texto conservando el mapa hacia el original: un carácter puede
 * producir varios plegados (`ß` → `ss`) y una marca suelta ninguno, así que no
 * alcanza con contar posiciones.
 */
function foldWithIndexes(text: string): FoldedText {
  const foldedChars: string[] = []
  const startIndexes: number[] = []
  const endIndexes: number[] = []
  let offset = 0

  for (const char of Array.from(text)) {
    for (const folded of foldChar(char)) {
      foldedChars.push(folded)
      startIndexes.push(offset)
      endIndexes.push(offset + char.length)
    }
    offset += char.length
  }

  return { folded: foldedChars.join(""), startIndexes, endIndexes }
}

/**
 * Parte un texto en trozos resaltados y no resaltados según la búsqueda, con el
 * mismo criterio que el filtro: sin acentos ni mayúsculas. Sin búsqueda o sin
 * coincidencias devuelve el texto completo como un solo trozo sin resaltar.
 */
export function highlightSegments(
  text: string,
  query: string
): readonly HighlightSegment[] {
  const needle = foldSearchText(query)

  if (needle.length === 0 || text.length === 0) {
    return [{ text, isMatch: false }]
  }

  const { folded, startIndexes, endIndexes } = foldWithIndexes(text)
  const segments: HighlightSegment[] = []
  let originalCursor = 0
  let searchFrom = 0

  while (searchFrom < folded.length) {
    const foundAt = folded.indexOf(needle, searchFrom)
    if (foundAt === -1) {
      break
    }

    const matchStart = startIndexes[foundAt]
    const matchEnd = endIndexes[foundAt + needle.length - 1]

    if (matchStart > originalCursor) {
      segments.push({
        text: text.slice(originalCursor, matchStart),
        isMatch: false,
      })
    }
    segments.push({ text: text.slice(matchStart, matchEnd), isMatch: true })

    originalCursor = matchEnd
    searchFrom = foundAt + needle.length
  }

  if (originalCursor < text.length) {
    segments.push({ text: text.slice(originalCursor), isMatch: false })
  }

  return segments
}
