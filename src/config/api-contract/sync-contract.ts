import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

import { API_CONTRACT_PATH, parseApiContract } from "./contract.ts"

type SyncApiContractInput = {
  sourcePath: string
  destinationPath?: string
}

/**
 * Copia el contrato del back a la copia versionada de este repo. El back es la
 * única fuente: aquí solo se guarda el snapshot que usan generación y CI.
 */
export function syncApiContract({
  sourcePath,
  destinationPath = API_CONTRACT_PATH,
}: SyncApiContractInput): void {
  const source = resolve(process.cwd(), sourcePath)
  const destination = resolve(process.cwd(), destinationPath)
  let rawContract: string

  try {
    rawContract = readFileSync(source, "utf8")
  } catch (error) {
    throw new Error(
      `No se encontró el contrato del back en ${source}. Clona personal-os-back junto a este repo o define OPENAPI_SPEC_PATH.`,
      { cause: error }
    )
  }

  const contract = parseApiContract(rawContract, source)

  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, `${JSON.stringify(contract, null, 2)}\n`, "utf8")
}
