import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { describe, it } from "node:test"
import { fileURLToPath } from "node:url"

const financeRoot = join(dirname(fileURLToPath(import.meta.url)), "..")
const endpointsPath = join(
  financeRoot,
  "../../shared/constants/api-endpoints.ts",
)

describe("legacy category icon migration", () => {
  it("does not expose migrate-legacy-icons on the web client", () => {
    const endpoints = readFileSync(endpointsPath, "utf8")
    assert.equal(endpoints.includes("migrate-legacy-icons"), false)
    assert.equal(endpoints.includes("MIGRATE_LEGACY"), false)

    const payloads = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "catalog-payloads.ts"),
      "utf8",
    )
    assert.equal(payloads.includes("migrate-legacy-icons"), false)
  })
})
