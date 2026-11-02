import assert from "node:assert/strict"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { after, describe, it } from "node:test"

import {
  parseApiContract,
  readApiContract,
  resolveApiContractPath,
  resolveContractSourcePath,
} from "./contract.ts"

const TEMP_DIRECTORY = mkdtempSync(join(tmpdir(), "api-contract-"))

after(() => {
  rmSync(TEMP_DIRECTORY, { recursive: true, force: true })
})

function writeTempFile({ name, contents }: { name: string; contents: string }) {
  const path = join(TEMP_DIRECTORY, name)
  writeFileSync(path, contents, "utf8")
  return path
}

describe("contrato OpenAPI", () => {
  it("resuelve la ruta versionada desde la raíz del proyecto", () => {
    assert.equal(
      resolveApiContractPath("openapi/swagger-spec.json", TEMP_DIRECTORY),
      join(TEMP_DIRECTORY, "openapi", "swagger-spec.json")
    )
  })

  it("lee el contrato versionado del repo", () => {
    const contract = readApiContract()

    assert.ok(contract.paths["/api/finance/balance-sheet"])
  })

  it("falla con un mensaje accionable si el contrato no existe", () => {
    assert.throws(
      () => readApiContract(join(TEMP_DIRECTORY, "no-existe.json")),
      /pnpm api:contract/
    )
  })

  it("rechaza un contrato que no es JSON", () => {
    const brokenPath = writeTempFile({
      name: "roto.json",
      contents: "{ no es json",
    })

    assert.throws(() => readApiContract(brokenPath), /no es JSON válido/)
  })

  it("rechaza un JSON que no declara OpenAPI 3 ni rutas", () => {
    const incompletePath = writeTempFile({
      name: "incompleto.json",
      contents: JSON.stringify({ openapi: "2.0", paths: {} }),
    })

    assert.throws(
      () => readApiContract(incompletePath),
      /no declara OpenAPI 3, su información ni sus rutas/
    )
  })

  it("acepta un contrato OpenAPI 3 con rutas", () => {
    const contract = parseApiContract(
      JSON.stringify({
        openapi: "3.0.0",
        info: { title: "Personal OS API", version: "1.0.0" },
        paths: {},
      }),
      "memoria"
    )

    assert.equal(contract.openapi, "3.0.0")
  })

  it("toma el contrato del back por OPENAPI_SPEC_PATH", () => {
    assert.equal(
      resolveContractSourcePath(
        { OPENAPI_SPEC_PATH: "otro/contrato.json" },
        TEMP_DIRECTORY
      ),
      join(TEMP_DIRECTORY, "otro", "contrato.json")
    )
  })

  it("por defecto toma el contrato del repo hermano", () => {
    const workspace = join(TEMP_DIRECTORY, "personal-os")

    assert.equal(
      resolveContractSourcePath({}, join(workspace, "personal-os-web")),
      join(workspace, "personal-os-back", "swagger-spec.json")
    )
  })

  it("toma el repo hermano desde una copia en temp", () => {
    const workspace = join(TEMP_DIRECTORY, "personal-os")

    assert.equal(
      resolveContractSourcePath({}, join(workspace, "temp", "feat-155")),
      join(workspace, "personal-os-back", "swagger-spec.json")
    )
  })
})
