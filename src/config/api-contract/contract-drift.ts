import type { ApiContract } from "./contract.ts"

/** Claves de un Path Item que son operaciones HTTP; el resto son metadatos. */
const HTTP_METHODS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const satisfies readonly string[]

const KIND_LABELS = {
  path: "ruta",
  operation: "operación",
  schema: "esquema",
  content: "documento",
} as const

/** Tope de líneas del informe; el resto se cuenta para no inundar el log del CI. */
const MAX_LISTED_DIFFERENCES = 20

export type ContractDifferenceKind = keyof typeof KIND_LABELS

/** El cambio se lee desde el back, que es la fuente: `added` falta en la copia. */
export type ContractChange = "added" | "removed" | "changed"

export type ContractDifference = {
  kind: ContractDifferenceKind
  change: ContractChange
  name: string
}

type CompareContractsInput = {
  backContract: ApiContract
  vendoredContract: ApiContract
}

type CompareOperationsInput = {
  path: string
  backItem: Record<string, unknown>
  vendoredItem: Record<string, unknown>
}

/**
 * Diferencias entre el contrato que publica el back y la copia versionada del
 * cliente. El gate falla con cualquier diferencia: un parámetro agregado o
 * renombrado cambia el contrato, aunque el archivo siga siendo JSON válido.
 */
export function compareContracts({
  backContract,
  vendoredContract,
}: CompareContractsInput): ContractDifference[] {
  const differences = [
    ...comparePaths(backContract, vendoredContract),
    ...compareSchemas(backContract, vendoredContract),
  ]

  if (
    differences.length === 0 &&
    !sameDocument(backContract, vendoredContract)
  ) {
    differences.push({ kind: "content", change: "changed", name: "documento" })
  }

  return differences
}

export function formatContractDifferences(
  differences: readonly ContractDifference[]
): string[] {
  const listed = differences
    .slice(0, MAX_LISTED_DIFFERENCES)
    .map(formatContractDifference)

  if (differences.length <= MAX_LISTED_DIFFERENCES) {
    return listed
  }

  return [
    ...listed,
    `y ${differences.length - MAX_LISTED_DIFFERENCES} diferencias más`,
  ]
}

function formatContractDifference({
  kind,
  change,
  name,
}: ContractDifference): string {
  const label = KIND_LABELS[kind]

  switch (change) {
    case "added":
      return `${label} solo en el back: ${name}`
    case "removed":
      return `${label} solo en la copia versionada: ${name}`
    case "changed":
      return `${label} cambió en el back: ${name}`
    default:
      throw new Error(`Cambio de contrato desconocido: ${String(change)}`)
  }
}

function comparePaths(
  backContract: ApiContract,
  vendoredContract: ApiContract
): ContractDifference[] {
  const backPaths = backContract.paths as Record<
    string,
    Record<string, unknown>
  >
  const vendoredPaths = vendoredContract.paths as Record<
    string,
    Record<string, unknown>
  >

  return unionKeys(backPaths, vendoredPaths).flatMap((path) =>
    comparePathItem({
      path,
      backItem: backPaths[path],
      vendoredItem: vendoredPaths[path],
    })
  )
}

function comparePathItem({
  path,
  backItem,
  vendoredItem,
}: {
  path: string
  backItem: Record<string, unknown> | undefined
  vendoredItem: Record<string, unknown> | undefined
}): ContractDifference[] {
  if (!vendoredItem) {
    return [{ kind: "path", change: "added", name: path }]
  }

  if (!backItem) {
    return [{ kind: "path", change: "removed", name: path }]
  }

  return compareOperations({ path, backItem, vendoredItem })
}

function compareOperations({
  path,
  backItem,
  vendoredItem,
}: CompareOperationsInput): ContractDifference[] {
  const differences: ContractDifference[] = []

  for (const method of HTTP_METHODS) {
    const name = `${method.toUpperCase()} ${path}`
    const backOperation = backItem[method]
    const vendoredOperation = vendoredItem[method]

    if (!backOperation && !vendoredOperation) {
      continue
    }

    if (!vendoredOperation) {
      differences.push({ kind: "operation", change: "added", name })
      continue
    }

    if (!backOperation) {
      differences.push({ kind: "operation", change: "removed", name })
      continue
    }

    if (!sameValue(backOperation, vendoredOperation)) {
      differences.push({ kind: "operation", change: "changed", name })
    }
  }

  return differences
}

function compareSchemas(
  backContract: ApiContract,
  vendoredContract: ApiContract
): ContractDifference[] {
  const backSchemas = schemasOf(backContract)
  const vendoredSchemas = schemasOf(vendoredContract)

  return unionKeys(backSchemas, vendoredSchemas).flatMap((name) =>
    compareNamedValue({
      kind: "schema",
      name,
      backValue: backSchemas[name],
      vendoredValue: vendoredSchemas[name],
    })
  )
}

function compareNamedValue({
  kind,
  name,
  backValue,
  vendoredValue,
}: {
  kind: ContractDifferenceKind
  name: string
  backValue: unknown
  vendoredValue: unknown
}): ContractDifference[] {
  if (vendoredValue === undefined) {
    return [{ kind, change: "added", name }]
  }

  if (backValue === undefined) {
    return [{ kind, change: "removed", name }]
  }

  if (!sameValue(backValue, vendoredValue)) {
    return [{ kind, change: "changed", name }]
  }

  return []
}

function schemasOf(contract: ApiContract): Record<string, unknown> {
  const schemas = contract.components?.schemas

  return (schemas ?? {}) as Record<string, unknown>
}

function unionKeys(
  first: Record<string, unknown>,
  second: Record<string, unknown>
): string[] {
  return [...new Set([...Object.keys(first), ...Object.keys(second)])].sort()
}

/**
 * `info` cambia con cada release del back y no describe lo que el cliente puede
 * enviar o esperar, así que el gate compara rutas, operaciones y esquemas.
 */
function sameDocument(
  backContract: ApiContract,
  vendoredContract: ApiContract
): boolean {
  return (
    toCanonical(withoutInfo(backContract)) ===
    toCanonical(withoutInfo(vendoredContract))
  )
}

function withoutInfo(contract: ApiContract): Record<string, unknown> {
  const comparable: Record<string, unknown> = { ...contract }
  delete comparable.info

  return comparable
}

function sameValue(first: unknown, second: unknown): boolean {
  return toCanonical(first) === toCanonical(second)
}

/**
 * JSON con las claves de cada objeto ordenadas: el mismo contrato regenerado por
 * otra versión de Nest no debe fallar por el orden de las claves.
 */
function toCanonical(value: unknown): string {
  return JSON.stringify(sortKeys(value))
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys)
  }

  if (typeof value !== "object" || value === null) {
    return value
  }

  const sorted: Record<string, unknown> = {}

  for (const key of Object.keys(value).sort()) {
    const entry = (value as Record<string, unknown>)[key]

    if (entry === undefined) {
      continue
    }

    sorted[key] = sortKeys(entry)
  }

  return sorted
}
