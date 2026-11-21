import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { MESSAGE_STATUS_LABELS } from "./message-filters.ts"

describe("MESSAGE_STATUS_LABELS", () => {
  it("nombra todos los estados del correo", () => {
    assert.equal(MESSAGE_STATUS_LABELS.INGESTED, "Recibido")
    assert.equal(MESSAGE_STATUS_LABELS.REVIEW_REQUIRED, "En revisión")
    assert.equal(MESSAGE_STATUS_LABELS.DISCARDED, "Descartado")
  })
})
