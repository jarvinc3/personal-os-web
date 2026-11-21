import { readFileSync } from "node:fs"
import { basename, dirname, join, resolve } from "node:path"
import type { OpenAPI3 } from "openapi-typescript"

/**
 * Copia versionada del contrato que publica `personal-os-back` en su
 * `swagger-spec.json`. La genera `pnpm api:contract`; no la edites a mano.
 */
export const API_CONTRACT_PATH = "openapi/swagger-spec.json"

/** Carpeta del repo hermano dentro del workspace. */
const BACK_REPOSITORY_DIRECTORY = "personal-os-back"
const WORKTREE_PARENT_DIRECTORY = "temp"
const CONTRACT_FILE_NAME = "swagger-spec.json"

/** Documento OpenAPI 3 con la información y las rutas que exige el generador. */
export type ApiContract = OpenAPI3 & {
  info: { title: string; version: string }
  paths: NonNullable<OpenAPI3["paths"]>
}

export function resolveApiContractPath(
  path = API_CONTRACT_PATH,
  cwd = process.cwd()
): string {
  return resolve(cwd, path)
}

export function resolveContractSourcePath(
  env = process.env,
  cwd = process.cwd()
): string {
  const configuredPath = env.OPENAPI_SPEC_PATH?.trim()

  if (configuredPath) {
    return resolve(cwd, configuredPath)
  }

  return join(
    resolveWorkspaceRoot(cwd),
    BACK_REPOSITORY_DIRECTORY,
    CONTRACT_FILE_NAME
  )
}

/**
 * El workspace tiene la copia principal y una copia por rama dentro de `temp/`:
 * en ambas, el repo del back es hermano del contenedor del proyecto.
 */
function resolveWorkspaceRoot(cwd: string): string {
  const parent = dirname(cwd)

  return basename(parent) === WORKTREE_PARENT_DIRECTORY
    ? dirname(parent)
    : parent
}

export function readApiContract(path = API_CONTRACT_PATH): ApiContract {
  const absolutePath = resolveApiContractPath(path)

  return parseApiContract(
    readContractText({
      path: absolutePath,
      failureMessage: `No se encontró el contrato OpenAPI en ${absolutePath}. Ejecuta \`pnpm api:contract\` para copiarlo desde personal-os-back.`,
    }),
    absolutePath
  )
}

/** Lee el contrato que publica el back; la ruta la resuelve el llamador. */
export function readContractFile(path: string): ApiContract {
  const absolutePath = resolve(path)

  return parseApiContract(
    readContractText({
      path: absolutePath,
      failureMessage: `No se encontró el contrato del back en ${absolutePath}. Clona personal-os-back junto a este repo o define OPENAPI_SPEC_PATH.`,
    }),
    absolutePath
  )
}

function readContractText({
  path,
  failureMessage,
}: {
  path: string
  failureMessage: string
}): string {
  try {
    return readFileSync(path, "utf8")
  } catch (error) {
    throw new Error(failureMessage, { cause: error })
  }
}

export function parseApiContract(
  rawContract: string,
  sourcePath: string
): ApiContract {
  let document: unknown

  try {
    document = JSON.parse(rawContract)
  } catch (error) {
    throw new Error(`El contrato OpenAPI de ${sourcePath} no es JSON válido.`, {
      cause: error,
    })
  }

  if (!isApiContract(document)) {
    throw new Error(
      `El contrato OpenAPI de ${sourcePath} no declara OpenAPI 3, su información ni sus rutas.`
    )
  }

  return document
}

function isApiContract(value: unknown): value is ApiContract {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const document = value as {
    openapi?: unknown
    info?: { title?: unknown; version?: unknown }
    paths?: unknown
  }

  return (
    typeof document.openapi === "string" &&
    document.openapi.startsWith("3.") &&
    typeof document.info?.title === "string" &&
    typeof document.info.version === "string" &&
    typeof document.paths === "object" &&
    document.paths !== null
  )
}
