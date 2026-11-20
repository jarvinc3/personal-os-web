import { readFile } from "node:fs/promises"

import ts from "typescript"

const TSX_EXTENSION = ".tsx"

/**
 * Node no transforma JSX. Este hook compila los `.tsx` con el mismo
 * `typescript` que ya usa el repo; `--experimental-strip-types` sigue
 * encargándose de los `.ts`.
 */
export async function load(url, context, nextLoad) {
  if (!url.endsWith(TSX_EXTENSION)) {
    return nextLoad(url, context)
  }

  const source = await readFile(new URL(url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      sourceMap: false,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: url,
  })

  return {
    format: "module",
    shortCircuit: true,
    source: outputText,
  }
}
