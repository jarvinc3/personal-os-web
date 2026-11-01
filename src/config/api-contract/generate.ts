import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import openapiTS, { astToString } from "openapi-typescript"

import { API_CONTRACT_PATH, readApiContract } from "./contract.ts"

/** Tipos del cliente generados desde el contrato; no se editan a mano. */
export const API_SCHEMA_PATH = "src/config/api-contract/api-schema.ts"

const GENERATED_FILE_HEADER = `/**
 * Tipos del API de Personal OS generados por \`pnpm api:generate\` desde
 * ${API_CONTRACT_PATH}. No edites este archivo: cambia el contrato en
 * personal-os-back, ejecuta \`pnpm api:contract\` y regenera.
 */
`

export async function renderApiSchema(
  contractPath = API_CONTRACT_PATH
): Promise<string> {
  const contract = readApiContract(contractPath)
  const ast = await openapiTS(contract, { exportType: true })

  return `${GENERATED_FILE_HEADER}\n${astToString(ast)}`
}

export async function writeApiSchema(
  schemaPath = API_SCHEMA_PATH
): Promise<void> {
  const outputPath = resolve(process.cwd(), schemaPath)
  const contents = await renderApiSchema()

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, contents, "utf8")
}
