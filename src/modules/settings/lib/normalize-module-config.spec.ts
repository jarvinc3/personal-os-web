import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { normalizeModuleConfig } from "@/src/modules/settings/lib/normalize-module-config"

describe("configuración de revisión de Intelligence", () => {
  it("usa los valores por defecto del módulo ai", () => {
    assert.deepEqual(normalizeModuleConfig("ai", {}).email, {
      reviewConfidenceThreshold: 0.7,
      acceptVerifiedSenders: false,
    })
  })

  it("combina valores guardados y conserva los demás defaults", () => {
    assert.deepEqual(
      normalizeModuleConfig("ai", {
        email: { acceptVerifiedSenders: true },
      }).email,
      {
        reviewConfidenceThreshold: 0.7,
        acceptVerifiedSenders: true,
      }
    )
  })
})
