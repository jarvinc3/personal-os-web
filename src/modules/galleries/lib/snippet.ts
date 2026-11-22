/** Las dos partes copiables de un snippet del catálogo. */
export type SnippetParts = {
  importCode: string
  usageCode: string
}

const IMPORT_KEYWORD = "import"
const IMPORT_FROM = /\bfrom\s+["']/
const IMPORT_SIDE_EFFECT = /^import\s+["']/

function importStatementEnds(line: string): boolean {
  return IMPORT_FROM.test(line) || IMPORT_SIDE_EFFECT.test(line)
}

/**
 * Separa un snippet en su importación y su uso. Las importaciones van primero
 * y una puede ocupar varias líneas hasta su `from "…"`; lo demás es el uso.
 */
export function splitSnippet(snippet: string): SnippetParts {
  const lines = snippet.split("\n")
  const importLines: string[] = []
  let index = 0
  let insideImport = false

  while (index < lines.length) {
    const line = lines[index].trim()

    if (line.length === 0) {
      index += 1
      continue
    }
    if (!insideImport && !line.startsWith(IMPORT_KEYWORD)) {
      break
    }

    importLines.push(line)
    insideImport = !importStatementEnds(line)
    index += 1
  }

  return {
    importCode: importLines.join("\n"),
    usageCode: lines.slice(index).join("\n").trim(),
  }
}
