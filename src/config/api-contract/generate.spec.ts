import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

import { API_CONTRACT_PATH } from "./contract.ts"
import { API_SCHEMA_PATH, renderApiSchema, writeApiSchema } from "./generate.ts"

const TEMP_DIRECTORY = mkdtempSync(join(tmpdir(), "api-schema-"))

after(() => {
  rmSync(TEMP_DIRECTORY, { recursive: true, force: true })
})

describe("generación de los tipos del API", () => {
  it("no cambia el archivo versionado cuando el contrato no cambió", async () => {
    const committedSchema = readFileSync(
      join(process.cwd(), API_SCHEMA_PATH),
      "utf8"
    )

    assert.equal(await renderApiSchema(), committedSchema)
  })

  it("deja claro que el archivo se genera desde el contrato", async () => {
    const schema = await renderApiSchema()

    assert.match(schema, /generados por `pnpm api:generate`/)
    assert.ok(schema.includes(API_CONTRACT_PATH))
  })

  it("falla si el contrato no está disponible", async () => {
    await assert.rejects(
      renderApiSchema(join(TEMP_DIRECTORY, "sin-contrato.json")),
      /pnpm api:contract/
    )
  })

  it("escribe el archivo generado en la ruta indicada", async () => {
    const schemaPath = join(TEMP_DIRECTORY, "api-schema.ts")

    await writeApiSchema(schemaPath)

    assert.equal(readFileSync(schemaPath, "utf8"), await renderApiSchema())
  })
})
