import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const ALIAS_PREFIX = "@/"
const NEXT_PREFIX = "next/"
const RELATIVE_PREFIXES = ["./", "../"]
const NODE_MODULES_DIRECTORY = "node_modules"
const JS_EXTENSION = ".js"
const CANDIDATE_EXTENSIONS = ["", ".ts", ".tsx"]
const INDEX_EXTENSIONS = [".ts", ".tsx"]

function firstExistingFile(candidates) {
  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  )
}

/** Resuelve los imports internos que usan el alias `@/`. */
function resolveAlias(specifier) {
  const basePath = path.join(
    REPOSITORY_ROOT,
    specifier.slice(ALIAS_PREFIX.length)
  )
  const directMatch = firstExistingFile(
    CANDIDATE_EXTENSIONS.map((extension) => `${basePath}${extension}`)
  )

  if (directMatch) {
    return { url: pathToFileURL(directMatch).href, shortCircuit: true }
  }

  const indexMatch = firstExistingFile(
    INDEX_EXTENSIONS.map((extension) =>
      path.join(basePath, `index${extension}`)
    )
  )

  if (indexMatch) {
    return { url: pathToFileURL(indexMatch).href, shortCircuit: true }
  }

  throw new Error(`No se pudo resolver el alias ${specifier}`)
}

/** Los componentes importan sus vecinos con `./` o `../` sin extensión. */
function resolveRelativeSource(specifier, parentURL) {
  if (!parentURL?.startsWith("file:")) {
    return undefined
  }

  const basePath = path.resolve(
    path.dirname(fileURLToPath(parentURL)),
    specifier
  )
  const directMatch = firstExistingFile(
    CANDIDATE_EXTENSIONS.map((extension) => `${basePath}${extension}`)
  )

  if (directMatch) {
    return directMatch
  }

  return firstExistingFile(
    INDEX_EXTENSIONS.map((extension) =>
      path.join(basePath, `index${extension}`)
    )
  )
}

/** Node no conoce los subpaths de `next/*`; el build los resuelve a `.js`. */
function resolveNextModule(specifier) {
  if (!specifier.startsWith(NEXT_PREFIX) || path.extname(specifier)) {
    return undefined
  }

  const basePath = path.join(
    REPOSITORY_ROOT,
    NODE_MODULES_DIRECTORY,
    specifier
  )

  return firstExistingFile([
    `${basePath}${JS_EXTENSION}`,
    path.join(basePath, `index${JS_EXTENSION}`),
  ])
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith(ALIAS_PREFIX)) {
    return resolveAlias(specifier)
  }

  const nextModule = resolveNextModule(specifier)

  if (nextModule) {
    return { url: pathToFileURL(nextModule).href, shortCircuit: true }
  }

  if (RELATIVE_PREFIXES.some((prefix) => specifier.startsWith(prefix))) {
    const relativeSource = resolveRelativeSource(
      specifier,
      context.parentURL
    )

    if (relativeSource) {
      return { url: pathToFileURL(relativeSource).href, shortCircuit: true }
    }
  }

  return nextResolve(specifier, context)
}
