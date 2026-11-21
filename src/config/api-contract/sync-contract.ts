import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"

import { API_CONTRACT_PATH, readContractFile } from "./contract.ts"

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
  const destination = resolve(process.cwd(), destinationPath)
  const contract = readContractFile(resolve(process.cwd(), sourcePath))

  mkdirSync(dirname(destination), { recursive: true })
  writeFileSync(destination, `${JSON.stringify(contract, null, 2)}\n`, "utf8")
}
