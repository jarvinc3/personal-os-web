import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseHelpText } from "./help-text.ts"

describe("parseHelpText", () => {
  it("keeps plain text as a single segment", () => {
    assert.deepEqual(parseHelpText("Sin enlaces."), [
      { kind: "text", value: "Sin enlaces." },
    ])
  })

  it("reads glossary links and surrounding text", () => {
    assert.deepEqual(
      parseHelpText("Suma el [[disponible|disponible]] al total."),
      [
        { kind: "text", value: "Suma el " },
        { kind: "term", value: "disponible", slug: "disponible" },
        { kind: "text", value: " al total." },
      ]
    )
  })

  it("reads guide links with the guia prefix", () => {
    assert.deepEqual(
      parseHelpText("Sigue [[Notificaciones|guia:notificaciones]]."),
      [
        { kind: "text", value: "Sigue " },
        {
          kind: "guide",
          value: "Notificaciones",
          slug: "notificaciones",
        },
        { kind: "text", value: "." },
      ]
    )
  })

  it("rejects a link with an empty label or target", () => {
    assert.throws(() => parseHelpText("[[ |patrimonio]]"), /Invalid help link/)
  })
})
