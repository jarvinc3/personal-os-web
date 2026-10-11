import fs from "node:fs"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const REPOSITORY_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const ALIAS_PREFIX = "@/"
const CANDIDATE_EXTENSIONS = ["", ".ts", ".tsx"]
const INDEX_EXTENSIONS = [".ts", ".tsx"]

function firstExistingFile(candidates) {
  return candidates.find(
    (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile()
  )
}

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith(ALIAS_PREFIX)) {
    return nextResolve(specifier, context)
  }
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
