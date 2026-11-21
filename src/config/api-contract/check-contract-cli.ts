import {
  readApiContract,
  readContractFile,
  resolveApiContractPath,
  resolveContractSourcePath,
} from "./contract.ts"
import {
  compareContracts,
  formatContractDifferences,
} from "./contract-drift.ts"

const sourcePath = resolveContractSourcePath()
const destinationPath = resolveApiContractPath()

const differences = compareContracts({
  backContract: readContractFile(sourcePath),
  vendoredContract: readApiContract(destinationPath),
})

if (differences.length === 0) {
  process.stdout.write(
    `Contrato OpenAPI en orden: ${destinationPath} coincide con ${sourcePath}.\n`
  )
} else {
  process.stderr.write(
    [
      `El contrato versionado ${destinationPath} no coincide con el del back ${sourcePath}:`,
      ...formatContractDifferences(differences).map((line) => `  - ${line}`),
      "",
      "Ejecuta `pnpm api:contract && pnpm api:generate` y commitea el resultado.",
      "",
    ].join("\n")
  )
  process.exitCode = 1
}
