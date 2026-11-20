import { readFile } from "node:fs/promises"

import ts from "typescript"

const CSS_EXTENSION = ".css"
const TSX_EXTENSION = ".tsx"

/**
 * Node no transforma JSX. Este hook compila los `.tsx` con el mismo
 * `typescript` que ya usa el repo; `--experimental-strip-types` sigue
 * encargándose de los `.ts`. Los `.css` que importa un componente de Next
 * se resuelven como módulos vacíos: la prueba no mira estilos.
 */
export async function load(url, context, nextLoad) {
  if (url.endsWith(CSS_EXTENSION)) {
    return {
      format: "module",
      shortCircuit: true,
      source: "",
    }
  }

  if (!url.endsWith(TSX_EXTENSION)) {
    return nextLoad(url, context)
  }

  const source = await readFile(new URL(url), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      inlineSourceMap: true,
      inlineSources: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
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
