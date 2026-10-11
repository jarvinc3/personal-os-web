import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { institutionSchema } from "./institution-form.ts"

const validInstitution = {
  name: "Banco",
  color: "",
  country: "",
  type: "bank" as const,
  shortName: "",
  sortOrder: "",
  domain: "",
}

describe("institutionSchema", () => {
  it("accepts a known institution type", () => {
    assert.equal(institutionSchema.safeParse(validInstitution).success, true)
  })

  it("rejects an unknown institution type", () => {
    assert.equal(
      institutionSchema.safeParse({ ...validInstitution, type: "unknown" })
        .success,
      false
    )
  })
})
