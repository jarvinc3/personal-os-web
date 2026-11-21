import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  MESSAGE_STATUS_FILTERS,
  MESSAGE_STATUS_LABELS,
} from "./message-filters.ts"

describe("MESSAGE_STATUS_LABELS", () => {
  it("nombra todos los estados del correo", () => {
    assert.equal(MESSAGE_STATUS_LABELS.INGESTED, "Recibido")
    assert.equal(MESSAGE_STATUS_LABELS.REVIEW_REQUIRED, "En revisión")
    assert.equal(MESSAGE_STATUS_LABELS.DISCARDED, "Descartado")
  })
})

describe("MESSAGE_STATUS_FILTERS", () => {
  it("ofrece solo los estados que el API acepta como filtro", () => {
    assert.deepEqual(
      [...MESSAGE_STATUS_FILTERS],
      ["INGESTED", "QUEUED", "PROCESSED", "REVIEW_REQUIRED", "FAILED"]
    )
    assert.ok(
      !(MESSAGE_STATUS_FILTERS as readonly string[]).includes("CLASSIFYING")
    )
    assert.ok(
      !(MESSAGE_STATUS_FILTERS as readonly string[]).includes("DISCARDED")
    )
  })
})
