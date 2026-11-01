import {
  resolveApiContractPath,
  resolveContractSourcePath,
} from "./contract.ts"
import { syncApiContract } from "./sync-contract.ts"

const destinationPath = resolveApiContractPath()

syncApiContract({
  sourcePath: resolveContractSourcePath(),
  destinationPath,
})

process.stdout.write(`Contrato OpenAPI actualizado en ${destinationPath}.\n`)
