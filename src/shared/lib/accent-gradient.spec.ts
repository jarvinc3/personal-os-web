import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { accentSurfaceGradient } from "./accent-gradient.ts"

describe("accentSurfaceGradient", () => {
  it("matches the institution hero gradient", () => {
    assert.equal(
      accentSurfaceGradient("#1B4332"),
      "linear-gradient(160deg, #1B4332 0%, #0b1220 100%)",
    )
  })
})
