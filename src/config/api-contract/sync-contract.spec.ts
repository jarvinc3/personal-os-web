import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

import { syncApiContract } from "./sync-contract.ts"

const TEMP_DIRECTORY = mkdtempSync(join(tmpdir(), "api-contract-sync-"))

after(() => {
  rmSync(TEMP_DIRECTORY, { recursive: true, force: true })
})

describe("sincronización del contrato", () => {
  it("copia el contrato del back a la copia versionada", () => {
    const sourcePath = join(TEMP_DIRECTORY, "swagger-spec.json")
    const destinationPath = join(TEMP_DIRECTORY, "openapi", "swagger-spec.json")
    const contract = {
      openapi: "3.0.0",
      info: { title: "Personal OS API", version: "1.0.0" },
      paths: { "/api/health": {} },
    }

    writeFileSync(sourcePath, `${JSON.stringify(contract, null, 2)}\n`, "utf8")

    syncApiContract({ sourcePath, destinationPath })

    assert.deepEqual(
      JSON.parse(readFileSync(destinationPath, "utf8")),
      contract
    )
  })

  it("falla con un mensaje accionable si el back no está disponible", () => {
    assert.throws(
      () =>
        syncApiContract({
          sourcePath: join(TEMP_DIRECTORY, "sin-back.json"),
          destinationPath: join(TEMP_DIRECTORY, "copia.json"),
        }),
      /OPENAPI_SPEC_PATH/
    )
  })
})
